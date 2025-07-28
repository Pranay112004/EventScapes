import React from "react";
import { Link } from "react-router-dom";

const GroupCard = ({ group }) => {
  const memberCount = group.members?.length || 0;
  const isPrivate = group.isPrivate;

  return (
    <div className="group-card">
      <Link to={`/groups/${group._id}`} className="group-card-link">
        <div className="group-card-image">
          <img 
            src={group.coverImage || "https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"} 
            alt={group.name}
          />
          {isPrivate && (
            <div className="private-badge">
              <span>🔒 Private</span>
            </div>
          )}
        </div>
        
        <div className="group-card-content">
          <div className="group-card-header">
            <h3 className="group-title">{group.name}</h3>
            <p className="group-description">
              {group.description || "No description available"}
            </p>
          </div>
          
          <div className="group-card-footer">
            <div className="group-admin">
              <img 
                src={group.admin?.avatarUrl || "https://i.pravatar.cc/150?u=default"} 
                alt={group.admin?.name || "Admin"}
                className="admin-avatar"
              />
              <span className="admin-name">Admin: {group.admin?.name || "Unknown"}</span>
            </div>
            
            <div className="group-stats">
              <span className="member-count">
                👥 {memberCount} member{memberCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default GroupCard;
