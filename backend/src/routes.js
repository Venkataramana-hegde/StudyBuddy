import { Router } from "express";
import helmet from "helmet";
import morgan from "morgan";

const router = Router();

router.use(helmet());
router.use(morgan('combined'));

router.use((req, res, next) => {
    if(req.method === 'POST' || req.method === 'PUT'){
        if(!req.is('application/json')){
            return res.status('Content type must be application/json');
        }
    }
    next();
})

router.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

export default router;