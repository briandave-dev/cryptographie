export class ClientCrypto {
  
    // Convertir clé PEM en format utilisable par WebCrypto
    static async importPublicKey(pemKey: string): Promise<CryptoKey> {
      const binaryDer = this.pemToBinary(pemKey);
      return await window.crypto.subtle.importKey(
        'spki',
        binaryDer,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256',
        },
        false,
        ['encrypt']
      );
    }
  
    // Convertir PEM en binaire
    static pemToBinary(pem: string): ArrayBuffer {
      const base64 = pem
        .replace(/-----BEGIN PUBLIC KEY-----/, '')
        .replace(/-----END PUBLIC KEY-----/, '')
        .replace(/\s/g, '');
      
      const binaryString = window.atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    }
  
    // Chiffrer l'ID d'option avec la clé publique admin
    static async encryptOptionId(optionId: string, publicKey: CryptoKey): Promise<string> {
      const encoder = new TextEncoder();
      const data = encoder.encode(optionId);
      
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'RSA-OAEP'
        },
        publicKey,
        data
      );
      
      // Convertir en base64 pour l'envoi
      const encryptedArray = new Uint8Array(encryptedBuffer);
      return btoa(String.fromCharCode(...encryptedArray));
    }
  }