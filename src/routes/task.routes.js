import {Router} from "express"
import { getTasks, getTaskById, updateTask, deleteTask, createTask, createSubTask, updateSubTask, deleteSubTask } from "../controllers/task.controllers.js"
import {validate} from "../middlewares/validator.middleware.js"
import {createTaskValidator, updateTaskValidator, createSubTaskValidator, updateSubTaskValidator} from "../validators/index.js"
import {verifyJWT, validateProjectPermission} from "../middlewares/auth.middleware.js"
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js"
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT)

router
  .route("/:projectId")
  .get(validateProjectPermission(AvailableUserRole), getTasks)
  .post(
    validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), 
    upload.array("attachments"),
    createTaskValidator(), 
    validate, 
    createTask
  );

router
  .route("/:projectId/t/:taskId")
  .get(validateProjectPermission(AvailableUserRole), getTaskById)
  .put(
    validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), 
    upload.array("attachments"),
    updateTaskValidator(), 
    validate, 
    updateTask
  )
  .delete(
    validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), 
    deleteTask
  )


router
  .route("/:projectId/t/:taskId/subtasks")
  .post(
    validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), 
    createSubTaskValidator(),
    validate,
    createSubTask
  )

router
  .route("/:projectId/st/:subTaskId")
  .put(
    validateProjectPermission(AvailableUserRole),
    updateSubTaskValidator(),
    validate,
    updateSubTask
  )
  .delete(
    validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), 
    deleteSubTask
  )

export default router