const { Router } = require('express');
const bcrypt = require('bcrypt');
const { query } = require('../config/db');
const { loginSchema } = require('../validators/schemas');
const { asyncHandler, HttpError } = require('../middleware/errorHandler');
const { signToken } = require('../middleware/auth');

const router = Router();

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const { rows } = await query('SELECT id, nombre, email, especialidad, password FROM profesionales WHERE email = $1', [email]);
    const user = rows[0];
    // Mismo mensaje en ambos casos: no revela si el email existe.
    if (!user || !(await bcrypt.compare(password, user.password))) throw new HttpError(401, 'Credenciales inválidas');
    const { password: _, ...profesional } = user;
    res.json({ token: signToken(profesional), profesional });
  }),
);

module.exports = router;
