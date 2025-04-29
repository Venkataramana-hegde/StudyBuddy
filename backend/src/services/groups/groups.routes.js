import {Router} from 'express';
import {
  createGroup,
  getGroups,
  join,
  getGroupDetails,
  leaveGroup,
  deleteGroup,
  updateGroup,
  removeMember,
  searchGroups,
  inviteMember,
  listAllGroups,
  inviteCode,
  joinGroup,
} from "./groups.controller.js";
import authenticate from '../../middlewares/authMiddleware.js';

const router = Router();

router.post("/",authenticate, createGroup);
router.post("/:groupId/join", authenticate, join);
router.get("/my-groups", authenticate, getGroups);          //Get all groups of user
router.get("/:groupId", authenticate, getGroupDetails);     //Get group details by ID
router.post("/:groupId/leave", authenticate, leaveGroup);
router.delete("/:groupId", authenticate, deleteGroup);
router.patch("/:groupId", authenticate, updateGroup);
router.delete("/:groupId/members/:userId", authenticate, removeMember);
router.get('/search', authenticate, searchGroups);
router.post('/:groupId/invite', authenticate, inviteMember); 
router.get('/public', authenticate, listAllGroups);
router.get('/:groupId/inviteCode', authenticate, inviteCode);
router.post("/join", authenticate, joinGroup);

export default router;