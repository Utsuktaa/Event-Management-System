const ROLE_PERMISSIONS = {
  president: [
    "create_event",
    "edit_event",
    "delete_event",
    "approve_join_request",
    "reject_join_request",
    "create_post",
    "delete_post",
    "moderate_posts",
    "view_analytics",
    "manage_members",
    "assign_roles",
  ],
  vice_president: [
    "create_event",
    "edit_event",
    "approve_join_request",
    "reject_join_request",
    "create_post",
    "delete_post",
    "moderate_posts",
    "view_analytics",
    "manage_members",
  ],
  club_admin: [
    "create_event",
    "edit_event",
    "approve_join_request",
    "reject_join_request",
    "create_post",
    "delete_post",
    "view_analytics",
    "manage_members",
  ],
  member: [
    "create_post",
  ],
};

function hasPermission(role, permission) {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return perms.includes(permission);
}

module.exports = { ROLE_PERMISSIONS, hasPermission };
