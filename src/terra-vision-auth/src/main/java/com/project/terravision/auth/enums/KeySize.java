package com.project.terravision.auth.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum KeySize {
    WEAK(1024),
    STANDARD(2048),
    HIGH(3072),
    ULTRA(2096);

    private final int bits;
}
