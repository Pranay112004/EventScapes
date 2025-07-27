import React from "react";
import { Link } from "react-router-dom";

const UserCard = ({ user }) => {
  return (
    <Link to={`/users/${user._id}`} className="user-card">
      <img src={user.avatarUrl} alt={user.name} className="user-card-avatar" />
      <h3 className="user-card-name">{user.name}</h3>
    </Link>
  );
};

export default UserCard;
