package com.project.terravision.auth.service;

import com.project.terravision.auth.model.Permission;
import com.project.terravision.auth.model.User;

import java.util.Set;

public interface AuthoritiesService {
    Set<Permission> getUserPermissions(User user);
}
