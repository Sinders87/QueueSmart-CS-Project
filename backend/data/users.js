const db = require('./db');
const bcrypt = require('bcrypt');

function getUserByEmail(email) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                uc.user_id,
                uc.email,
                uc.password_hash,
                uc.role,
                up.full_name,
                up.contact_info,
                up.preferences
            FROM UserCredentials uc
            LEFT JOIN UserProfile up
                ON uc.user_id = up.user_id
            WHERE uc.email = ?
        `;

        db.get(sql, [email], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row || null);
            }
        });
    });
}

function createUser({ fullName, email, password, role, contactInfo = null, preferences = null }) {
    return new Promise(async (resolve, reject) => {
        try {
            const existingUser = await getUserByEmail(email);

            if (existingUser) {
                return reject(new Error('Email already registered'));
            }

            const passwordHash = await bcrypt.hash(password, 10);

            db.run(
                `
                INSERT INTO UserCredentials (email, password_hash, role)
                VALUES (?, ?, ?)
                `,
                [email, passwordHash, role],
                function (err) {
                    if (err) {
                        return reject(err);
                    }

                    const userId = this.lastID;

                    db.run(
                        `
                        INSERT INTO UserProfile (user_id, full_name, email, contact_info, preferences)
                        VALUES (?, ?, ?, ?, ?)
                        `,
                        [userId, fullName, email, contactInfo, preferences],
                        function (profileErr) {
                            if (profileErr) {
                                return reject(profileErr);
                            }

                            resolve({
                                user_id: userId,
                                full_name: fullName,
                                email,
                                role,
                                contact_info: contactInfo,
                                preferences
                            });
                        }
                    );
                }
            );
        } catch (error) {
            reject(error);
        }
    });
}

function validateLogin(email, password, role) {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await getUserByEmail(email);

            if (!user) {
                return resolve(null);
            }

            if (user.role !== role) {
                return resolve(null);
            }

            const passwordMatch = await bcrypt.compare(password, user.password_hash);

            if (!passwordMatch) {
                return resolve(null);
            }

            resolve({
                id: user.user_id,
                name: user.full_name,
                email: user.email,
                role: user.role
            });
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    getUserByEmail,
    createUser,
    validateLogin
};
