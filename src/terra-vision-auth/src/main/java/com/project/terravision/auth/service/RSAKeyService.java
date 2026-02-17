package com.project.terravision.auth.service;

import com.nimbusds.jose.jwk.RSAKey;
import com.project.terravision.auth.config.properties.SecurityProperties;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;
import java.util.UUID;

@Slf4j
@Service
public class RSAKeyService {
    @Getter
    private volatile RSAKey activeKey;
    private final SecurityProperties securityProperties;

    public RSAKeyService(SecurityProperties securityProperties) throws NoSuchAlgorithmException {
        this.securityProperties = securityProperties;
        this.activeKey = generateKey();
    }

    public RSAKey generateKey() throws NoSuchAlgorithmException {
        KeyPair keyPair = generateKeyPair();

        String keyId = UUID.randomUUID().toString();
        RSAKey rsaKey = new RSAKey.Builder((RSAPublicKey) keyPair.getPublic())
                .privateKey((RSAPrivateKey) keyPair.getPrivate())
                .keyID(keyId)
                .build();

        printKeyPair(keyPair); // This line should be removed for production environment
        log.info("RSA-{} key pair generated [kid={}]", securityProperties.getKeyPair().getSize(), keyId);
        return rsaKey;
    }

    public synchronized void rotateKey() throws NoSuchAlgorithmException {
        this.activeKey = generateKey();
        log.info("RSA-{} key pair rotated [kid={}]", securityProperties.getKeyPair().getSize(), activeKey.getKeyID());
    }

    private KeyPair generateKeyPair() throws NoSuchAlgorithmException {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");

        generator.initialize(securityProperties.getKeyPair().getSize());
        return generator.generateKeyPair();
    }

    // Helper function for testing purposes to print the generated keypair
    private void printKeyPair(KeyPair keyPair) {
        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
        RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();

        log.info("Public Key:\n{}",
                toPem("PUBLIC KEY", publicKey.getEncoded()));

        log.info("Private Key:\n{}",
                toPem("PRIVATE KEY", privateKey.getEncoded()));
    }

    // Helper function for testing purposes to convert the generated keypair to pem
    private String toPem(String type, byte[] encoded) {
        String base64 = Base64.getMimeEncoder(64, "\n".getBytes())
                .encodeToString(encoded);

        return "-----BEGIN " + type + "-----\n"
                + base64 +
                "\n-----END " + type + "-----";
    }
}
