// utils/encryption.js

export function encryptPayload(data) {
    const jsonString = JSON.stringify(data);
    return Buffer.from(jsonString).toString('base64');
}

export function decryptResponse(encodedData) {
    const decodedString = Buffer.from(encodedData, 'base64').toString('utf8');
   
    return JSON.parse(decodedString);
}
