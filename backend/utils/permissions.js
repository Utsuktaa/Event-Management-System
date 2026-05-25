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
    "create_poll",
    "manage_polls",
    "pin_poll",
    "convert_poll_to_event",
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
    "create_poll",
    "manage_polls",
    "pin_poll",
    "convert_poll_to_event",
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
    "create_poll",
    "manage_polls",
    "pin_poll",
    "convert_poll_to_event",
  ],
  member: [
    "create_post",
    "create_poll",
  ],
};

function hasPermission(role, permission) {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return perms.includes(permission);
}

module.exports = { ROLE_PERMISSIONS, hasPermission };
