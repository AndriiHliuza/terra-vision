package com.project.terravision.auth.service;

public interface CacheService<K, V> {
    void cache(K key, V value);
    void evict(K key);
}
