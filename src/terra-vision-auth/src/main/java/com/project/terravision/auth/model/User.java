package com.project.terravision.auth.model;

import com.project.terravision.auth.model.enums.AccountState;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Builder
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String username;

    @Email
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank
    @Column(nullable = false)
    private String password;

    private String firstname;
    private String lastname;

    @Column(length = 512)
    private String imageId;

    // --- Account state

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false)
    private AccountState accountState;

    // --- Audit & Metadata Information ---

    private Instant verifiedAt;
    private Instant blockedAt;

    @ManyToOne
    @JoinColumn(name = "blocked_by")
    private User blockedBy;

    private String blockReason;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    // --- User's role
    @ManyToOne
    private Role role;

    public User(String username, String email, String password, String firstname, String lastname, AccountState accountState, Role role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.firstname = firstname;
        this.lastname = lastname;
        this.accountState = accountState;
        this.role = role;
    }
}
