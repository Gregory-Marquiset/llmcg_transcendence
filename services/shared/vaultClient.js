import fs from 'fs';
import axios from 'axios';

const VAULT_ADDR = process.env.VAULT_ADDR || 'http://vault:8200';
const SERVICE_NAME = process.env.SERVICE_NAME; // 'auth', 'users', 'statistics', etc.

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getApproleFilePath() {
    if (!SERVICE_NAME) {
        console.warn('[VaultClient] ⚠️ SERVICE_NAME not set, using legacy approle.json');
        return '/vault/secrets/approle.json';
    }
    
    const servicePath = `/vault/secrets/${SERVICE_NAME}-approle.json`;
    
    if (fs.existsSync(servicePath)) {
        return servicePath;
    }
    
    console.warn(`[VaultClient] ⚠️ ${servicePath} not found, falling back to approle.json`);
    return '/vault/secrets/approle.json';
}

async function waitForVaultReady(timeout = 60000) {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
        try {
            const res = await axios.get(`${VAULT_ADDR}/v1/sys/health`, {
                validateStatus: () => true
            });
            
            if (res.status === 200 || res.status === 429 || res.status === 473) {
                console.log('[VaultClient] ✅ Vault is ready and unsealed');
                return true;
            }
            
            if (res.status === 503) {
                console.log('[VaultClient]  Vault is sealed, waiting...');
            } else if (res.status === 501) {
                console.log('[VaultClient]  Vault is not initialized, waiting...');
            }
            
        } catch (err) {
            console.log(`[VaultClient]  Vault not accessible yet: ${err.message}`);
        }
        
        await sleep(2000);
    }
    
    throw new Error(`Vault did not become ready within ${timeout}ms`);
}

async function waitForApproleFile(timeout = 60000) {
    const filePath = getApproleFilePath();
    const start = Date.now();
    
    while (!fs.existsSync(filePath)) {
        if (Date.now() - start > timeout) {
            throw new Error(`Timeout: ${filePath} did not appear after ${timeout}ms`);
        }
        console.log(`[VaultClient]  Waiting for AppRole credentials at ${filePath}...`);
        await sleep(2000);
    }
    
    let retries = 3;
    while (retries > 0) {
        try {
            const raw = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(raw);
            
            if (data.role_id && data.secret_id) {
                console.log(`[VaultClient]  AppRole credentials file is ready: ${filePath}`);
                if (data.db_role) {
                    console.log(`[VaultClient]  Database role: ${data.db_role}`);
                }
                return;
            }
            
            throw new Error('AppRole file incomplete');
        } catch (err) {
            retries--;
            if (retries === 0) throw err;
            console.log(`[VaultClient] ⚠️ AppRole file not ready, retrying... (${retries} left)`);
            await sleep(1000);
        }
    }
}

export async function initVaultClient() {
    console.log('[VaultClient]  Starting Vault client initialization...');
    
    if (SERVICE_NAME) {
        console.log(`[VaultClient]  Service name: ${SERVICE_NAME}`);
    }
    
    // Étape 1: Attendre que Vault soit accessible et déverrouillé
    await waitForVaultReady();
    
    // Étape 2: Attendre que le fichier AppRole soit créé
    await waitForApproleFile();
    
    // Étape 3: Tester la connexion AppRole
    try {
        await loginAppRole();
        console.log('[VaultClient]  Successfully authenticated with AppRole');
    } catch (err) {
        console.error('[VaultClient]  Failed to authenticate:', err.message);
        throw err;
    }
    
    console.log('[VaultClient]  Vault client fully initialized');
}

async function loginAppRole(retries = 3) {
    const filePath = getApproleFilePath();
    let lastError;
    
    for (let i = 0; i < retries; i++) {
        try {
            const raw = fs.readFileSync(filePath, 'utf8');
            const { role_id, secret_id } = JSON.parse(raw);
            
            const res = await axios.post(`${VAULT_ADDR}/v1/auth/approle/login`, {
                role_id,
                secret_id
            });
            
            return res.data.auth.client_token;
        } catch (err) {
            lastError = err;
            console.log(`[VaultClient]  Login attempt ${i + 1}/${retries} failed: ${err.message}`);
            
            if (i < retries - 1) {
                await sleep(2000 * (i + 1));
            }
        }
    }
    
    throw new Error(`Failed to login after ${retries} attempts: ${lastError.message}`);
}

/**
 * Récupère un secret KV v2 de Vault
 */
export async function getVaultSecret(path) {
    const token = await loginAppRole();
    
    try {
        const res = await axios.get(`${VAULT_ADDR}/v1/${path}`, {
            headers: { 'X-Vault-Token': token }
        });
        
        return res.data.data.data;
    } catch (err) {
        console.error(`[VaultClient] Failed to get secret at ${path}:`, err.message);
        throw err;
    }
}

export async function getPostgresCreds() {
    const token = await loginAppRole();
    
    const filePath = getApproleFilePath();
    const raw = fs.readFileSync(filePath, 'utf8');
    const { db_role } = JSON.parse(raw);
    
    if (!db_role) {
        throw new Error('db_role not found in AppRole file. Using legacy configuration?');
    }
    
    try {
        console.log(`[VaultClient] Requesting credentials for database role: ${db_role}`);
        
        const res = await axios.get(`${VAULT_ADDR}/v1/database/creds/${db_role}`, {
            headers: { 'X-Vault-Token': token }
        });
        
        console.log(`[VaultClient] Received credentials for ${db_role} (username: ${res.data.data.username})`);
        
        return {
            username: res.data.data.username,
            password: res.data.data.password,
            lease_duration: res.data.lease_duration,
            db_role: db_role
        };
    } catch (err) {
        console.error(`[VaultClient] Failed to get Postgres credentials for ${db_role}:`, err.message);
        throw err;
    }
}

/**
 * Récupère les informations du rôle actuel
 */
export async function getCurrentRoleInfo() {
    const filePath = getApproleFilePath();
    
    if (!fs.existsSync(filePath)) {
        return null;
    }
    
    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(raw);
        
        return {
            service: SERVICE_NAME || 'unknown',
            db_role: data.db_role || 'unknown',
            file: filePath
        };
    } catch (err) {
        console.error('[VaultClient] Failed to read role info:', err.message);
        return null;
    }
}