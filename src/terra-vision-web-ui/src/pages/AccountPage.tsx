import {useAppContext} from "../configs/context/contexts.ts";
import "../styles/pages/AccountPage.css";
import {LogOut, MapIcon, Settings, Shield, Star, UserIcon} from "lucide-react";

function AccountPage() {

    const { user } = useAppContext();

    if (!user) {
        return (
            <div className="profile-loading">
                <div className="spinner"></div>
                <p>Loading user profile...</p>
            </div>
        );
    }

    const fullName = (user.firstname && user.lastname)
        ? `${user.firstname} ${user.lastname}`
        : user.username;

    return (
        <div className="profile-container">
            <aside className="profile-sidebar">
                <div className="profile-header-mini">
                    <div className="avatar-placeholder">
                        <UserIcon size={40} color="#5c8571" />
                        {/* Power level badge for the avatar */}
                        <div className="power-level-indicator" title={`Power Level: ${user.role.powerLevel}`}>
                            <Star size={12} fill="#ffcc00" color="#ffcc00" />
                            <span>{user.role.powerLevel}</span>
                        </div>
                    </div>
                    <h3>{fullName}</h3>
                    <span className="role-badge">{user.role.name}</span>
                </div>

                <nav className="profile-nav">
                    <button className="nav-item active"><UserIcon size={18} /> Account Info</button>
                    <button className="nav-item"><MapIcon size={18} /> My Features</button>
                    <button className="nav-item"><Shield size={18} /> Security</button>
                    <button className="nav-item"><Settings size={18} /> App Settings</button>
                    <hr className="nav-divider" />
                    <button className="nav-item logout"><LogOut size={18} /> Sign Out</button>
                </nav>
            </aside>

            <main className="profile-content">
                <section className="profile-section">
                    <div className="section-header">
                        <h2>Personal Information</h2>
                        <span className="joined-date">Member since {new Date(user.createdAt).getFullYear()}</span>
                    </div>

                    <div className="settings-grid">
                        <div className="input-group">
                            <label>First Name</label>
                            <input type="text" value={user.firstname ?? ""} placeholder="Not provided" readOnly />
                        </div>
                        <div className="input-group">
                            <label>Last Name</label>
                            <input type="text" value={user.lastname ?? ""} placeholder="Not provided" readOnly />
                        </div>
                        <div className="input-group">
                            <label>Username</label>
                            <input type="text" value={user.username} readOnly className="readonly-input" />
                        </div>
                        <div className="input-group">
                            <label>Email Address</label>
                            <input type="email" value={user.email} readOnly className="readonly-input" />
                        </div>
                        <div className="input-group full-width">
                            <label>Assigned Role</label>
                            <div className="role-input-wrapper">
                                <input type="text" value={user.role.name} readOnly className="readonly-input" />
                                <span className="power-text">Level {user.role.powerLevel} Access</span>
                            </div>
                        </div>
                    </div>

                    <div className="action-bar">
                        <button className="btn-secondary">View Permissions</button>
                        <button className="btn-primary">Request Change</button>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default AccountPage;