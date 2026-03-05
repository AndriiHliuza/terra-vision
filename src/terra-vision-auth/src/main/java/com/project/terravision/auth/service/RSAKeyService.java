package com.project.terravision.auth.service;

import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.RSAKey;
import com.project.terravision.auth.config.properties.KeySize;
import com.project.terravision.auth.config.properties.SecurityProperties;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Slf4j
@Service
public class RSAKeyService {

    @Getter
    private volatile RSAKey activeKey;
    private final List<TimestampedRSAKey> keyHistory = new CopyOnWriteArrayList<>();

    private int keyPairSize;
    private final Duration keyExpiration;

    public RSAKeyService(SecurityProperties securityProperties) throws NoSuchAlgorithmException {
        this.keyPairSize = securityProperties.getKeyPair().getSize().getBits();
        this.keyExpiration = securityProperties.getKeyPair().getKeyExpiration();
        this.activeKey = generateKey();
        keyHistory.add(new TimestampedRSAKey(activeKey));
    }

    public RSAKey generateKey() throws NoSuchAlgorithmException {
        KeyPair keyPair = generateKeyPair();

        String keyId = UUID.randomUUID().toString();
        RSAKey rsaKey = new RSAKey.Builder((RSAPublicKey) keyPair.getPublic())
                .privateKey((RSAPrivateKey) keyPair.getPrivate())
                .keyID(keyId)
                .build();

        printKeyPair(keyPair);
        log.info("RSA-{} key pair generated [kid={}]", keyPairSize, keyId);
        return rsaKey;
    }

    public synchronized void rotateKey() throws NoSuchAlgorithmException {
        activeKey = generateKey();
        keyHistory.addFirst(new TimestampedRSAKey(activeKey));
        pruneExpiredKeys();
        log.info("RSA-{} key pair rotated [kid={}]", keyPairSize, activeKey.getKeyID());
    }

    public synchronized void rotateKey(int keyPairSize) throws NoSuchAlgorithmException {
        this.keyPairSize = keyPairSize;
        rotateKey();
    }

    public synchronized void rotateKey(KeySize keySize) throws NoSuchAlgorithmException {
        rotateKey(keySize.getBits());
    }

    public synchronized void resetKeys() throws NoSuchAlgorithmException {
        keyHistory.clear();
        activeKey = generateKey();
        keyHistory.add(new TimestampedRSAKey(activeKey));
        log.info("RSA key history cleared, new RSA-{} key generated [kid={}]", keyPairSize, activeKey.getKeyID());
    }

    public synchronized void resetKeys(int keyPairSize) throws NoSuchAlgorithmException {
        this.keyPairSize = keyPairSize;
        resetKeys();
    }

    public synchronized void resetKeys(KeySize keySize) throws NoSuchAlgorithmException {
        resetKeys(keySize.getBits());
    }

    private KeyPair generateKeyPair() throws NoSuchAlgorithmException {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(keyPairSize);
        return generator.generateKeyPair();
    }

    private void pruneExpiredKeys() {
        Instant cutoff = Instant.now().minus(keyExpiration);
        keyHistory.removeIf(tk -> tk.getCreatedAt().isBefore(cutoff));
        log.info("Key history size after pruning: {}", keyHistory.size());
    }

    public List<JWK> getAllKeys() {
        return keyHistory.stream()
                .map(TimestampedRSAKey::getKey)
                .collect(Collectors.toList());
    }

    @Getter
    private static class TimestampedRSAKey {
        private final RSAKey key;
        private final Instant createdAt;

        public TimestampedRSAKey(RSAKey key) {
            this.key = key;
            this.createdAt = Instant.now();
        }
    }

    // ------ Helper functions ------

    // Helper function for testing purposes to print the generated keypair
    private void printKeyPair(KeyPair keyPair) {
        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
        RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();

        log.debug("Public Key:\n{}", toPem("PUBLIC KEY", publicKey.getEncoded()));
        log.debug("Private Key:\n{}", toPem("PRIVATE KEY", privateKey.getEncoded()));
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
