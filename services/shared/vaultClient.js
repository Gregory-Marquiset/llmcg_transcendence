import fs from 'fs';
import axios from 'axios';

const VAULT_ADDR = process.env.VAULT_ADDR || 'http://vault:8200';
const APPROLE_FILE = '/vault/secrets/approle.json';

let vaultToken = null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForFile(filePath, timeout = 30000) {
    const start = Date.now();
    while (!fs.existsSync(filePath)) {
        if (Date.now() - start > timeout) {
            throw new Error(`Timeout: ${filePath} did not appear after ${timeout}ms`);
        }
        console.log(`[VaultClient] Waiting for secrets file at ${filePath}...`);
        await sleep(1000);
    }
    console.log(`[VaultClient] Found secrets file: ${filePath}`);
}


async function loginAppRole() {
    await waitForFile(APPROLE_FILE);
    const raw = fs.readFileSync(APPROLE_FILE, 'utf8');
    const { role_id, secret_id } = JSON.parse(raw);

    const res = await axios.post(`${VAULT_ADDR}/v1/auth/approle/login`, { role_id, secret_id });
    return res.data.auth.client_token;
}


export async function getVaultSecret(path) {
    const token = await loginAppRole();

    const res = await axios.get(
        `${VAULT_ADDR}/v1/${path}`,
        {
            headers: {
                'X-Vault-Token': token
            }
        }
    );

    return res.data.data.data;
}

export async function getPostgresCreds() {
    const token = await loginAppRole();

    const res = await axios.get(`${VAULT_ADDR}/v1/database/creds/app-role`, {
        headers: { 'X-Vault-Token': token }
    });

    return {
        username: res.data.data.username,
        password: res.data.data.password,
        lease_duration: res.data.lease_duration 
    };
}