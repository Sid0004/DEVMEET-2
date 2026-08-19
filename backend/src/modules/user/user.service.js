import { User } from "./user.model.js";
import { Organization } from "../organization/organization.model.js";
import { ApiError } from "../../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

class UserService {
    static generateAccessAndRefreshTokens = async (userId) => {
        try {
            const user = await User.findById(userId);
            if (!user) throw new Error("User not found");
                
            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();

            user.refreshToken = refreshToken;
            await user.save({ validateBeforeSave: false });
            return { accessToken, refreshToken };
        }
        catch (error) {
            console.error(" TOKEN GENERATION ERROR:", error.message);
            throw new ApiError(500, `Something went wrong while generating tokens: ${error.message}`);
        }
    };

    static async registerUser(userData) {
        const { username, fullName, email, password, accountType = "individual", organizationName } = userData;
        const existedUser = await User.findOne({
            $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }]
        });

        if (existedUser) {
            throw new ApiError(409, "User with this email or username already exists");
        }

        const user = await User.create({
            fullName,
            avatar: `https://api.dicebear.com/7.x/dylan/svg?seed=${encodeURIComponent(username || fullName)}`,
            email: email.toLowerCase(),
            password,
            username: username.toLowerCase(),
            accountType: accountType === "organization" ? "organization" : "individual"
        });

        if (accountType === "organization" && organizationName && organizationName.trim()) {
            const baseSlug = organizationName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
            let slug = baseSlug || "org";
            let attempts = 0;
            while (await Organization.findOne({ slug }) && attempts < 5) {
                slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
                attempts++;
            }

            const org = await Organization.create({
                name: organizationName.trim(),
                slug,
                owner: user._id,
                members: [{ user: user._id, role: "Admin" }]
            });

            user.organizations = [org._id];
            await user.save({ validateBeforeSave: false });
        }

        const createdUser = await User.findById(user._id)
            .populate("organizations", "name slug")
            .select("-password -refreshToken");

        if (createdUser) return createdUser;
        else return null;
    }

    static async loginUser(userData) {
        const { loginIdentity, password } = userData;
        
        const user = await User.findOne({
            $or:[
                {username: loginIdentity.toLowerCase()},
                {email: loginIdentity.toLowerCase()}
            ]
        });

        if (!user) throw new ApiError(401, "Invalid email/username or password");

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) throw new ApiError(401, "Invalid email/username or password");

        const { accessToken, refreshToken } = await this.generateAccessAndRefreshTokens(user._id);
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        if (loggedInUser) return { accessToken, refreshToken, loggedInUser };
        else return null;
    }

    static async googleLogin(googleAuthToken) {
        if (!googleAuthToken) {
            throw new ApiError(400, "Google authentication token is required");
        }

        let payload;
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const client = new OAuth2Client(clientId);

        try {
            // Attempt 1: Verify as Google ID Token (standard Google credential / One-Tap JWT)
            const ticket = await client.verifyIdToken({
                idToken: googleAuthToken,
                audience: clientId ? [clientId] : undefined,
            });
            payload = ticket.getPayload();
        } catch (idTokenError) {
            // Attempt 2: Fallback to verify as OAuth2 access_token (Google popup flow)
            try {
                const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: { Authorization: `Bearer ${googleAuthToken}` },
                });
                if (userInfoRes.ok) {
                    payload = await userInfoRes.json();
                } else {
                    throw new Error("Unable to verify Google access token");
                }
            } catch (fetchError) {
                throw new ApiError(401, `Google verification failed: ${idTokenError?.message || "Invalid Google token"}`);
            }
        }

        if (!payload || !payload.email) {
            throw new ApiError(400, "Google account does not contain a valid email address");
        }

        const email = payload.email.toLowerCase();
        const googleId = payload.sub || payload.id;
        const fullName = payload.name || `${payload.given_name || ""} ${payload.family_name || ""}`.trim() || "Google User";
        const avatar = payload.picture;

        // Check if user already exists
        let user = await User.findOne({
            $or: [
                { googleId },
                { email }
            ]
        });

        if (user) {
            let updated = false;
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = "google";
                updated = true;
            }
            if (!user.avatar && avatar) {
                user.avatar = avatar;
                updated = true;
            }
            if (updated) {
                await user.save({ validateBeforeSave: false });
            }
        } else {
            // Auto-generate a clean unique username
            const rawUsername = (email.split("@")[0] || fullName)
                .toLowerCase()
                .replace(/[^a-z0-9_]/g, "_")
                .slice(0, 20);

            let username = rawUsername.length >= 3 ? rawUsername : `user_${Math.floor(1000 + Math.random() * 9000)}`;
            let attempts = 0;
            while (await User.findOne({ username }) && attempts < 10) {
                username = `${rawUsername.slice(0, 15)}_${Math.floor(1000 + Math.random() * 9000)}`;
                attempts++;
            }

            user = await User.create({
                username,
                fullName,
                email,
                avatar: avatar || `https://api.dicebear.com/7.x/dylan/svg?seed=${encodeURIComponent(username)}`,
                googleId,
                authProvider: "google",
                accountType: "individual",
                isOnboarded: false
            });
        }

        const { accessToken, refreshToken } = await this.generateAccessAndRefreshTokens(user._id);
        const loggedInUser = await User.findById(user._id)
            .populate("organizations", "name slug")
            .select("-password -refreshToken");

        if (loggedInUser) return { accessToken, refreshToken, loggedInUser };
        else return null;
    }

    static async githubLogin(code) {
        if (!code) {
            throw new ApiError(400, "GitHub authorization code is required");
        }

        // Exchange authorization code for GitHub access_token
        const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            }),
        });

        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) {
            throw new ApiError(401, `GitHub authentication failed: ${tokenData.error_description || "Invalid authorization code"}`);
        }

        const githubAccessToken = tokenData.access_token;

        // Fetch user profile from GitHub
        const userRes = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${githubAccessToken}`,
                "User-Agent": "Devmeet-App",
            },
        });

        if (!userRes.ok) {
            throw new ApiError(401, "Failed to fetch user profile from GitHub");
        }

        const ghUser = await userRes.json();

        // Fetch primary verified email from GitHub if email is not public
        let email = ghUser.email;
        if (!email) {
            const emailsRes = await fetch("https://api.github.com/user/emails", {
                headers: {
                    Authorization: `Bearer ${githubAccessToken}`,
                    "User-Agent": "Devmeet-App",
                },
            });

            if (emailsRes.ok) {
                const emails = await emailsRes.json();
                const primaryEmailObj = emails.find(e => e.primary && e.verified) || emails.find(e => e.verified) || emails[0];
                if (primaryEmailObj) {
                    email = primaryEmailObj.email;
                }
            }
        }

        const githubId = String(ghUser.id);
        const emailLower = (email || `${ghUser.login}@github.devmeet`).toLowerCase();
        const fullName = ghUser.name || ghUser.login || "GitHub User";
        const avatar = ghUser.avatar_url;

        // Check if user already exists
        let user = await User.findOne({
            $or: [
                { githubId },
                { email: emailLower }
            ]
        });

        if (user) {
            let updated = false;
            if (!user.githubId) {
                user.githubId = githubId;
                user.authProvider = "github";
                updated = true;
            }
            if (!user.avatar && avatar) {
                user.avatar = avatar;
                updated = true;
            }
            if (updated) {
                await user.save({ validateBeforeSave: false });
            }
        } else {
            // Generate clean unique username
            const rawUsername = (ghUser.login || emailLower.split("@")[0])
                .toLowerCase()
                .replace(/[^a-z0-9_]/g, "_")
                .slice(0, 20);

            let username = rawUsername.length >= 3 ? rawUsername : `user_${Math.floor(1000 + Math.random() * 9000)}`;
            let attempts = 0;
            while (await User.findOne({ username }) && attempts < 10) {
                username = `${rawUsername.slice(0, 15)}_${Math.floor(1000 + Math.random() * 9000)}`;
                attempts++;
            }

            user = await User.create({
                username,
                fullName,
                email: emailLower,
                avatar: avatar || `https://api.dicebear.com/7.x/dylan/svg?seed=${encodeURIComponent(username)}`,
                githubId,
                authProvider: "github",
                accountType: "individual",
                isOnboarded: false
            });
        }

        const { accessToken, refreshToken } = await this.generateAccessAndRefreshTokens(user._id);
        const loggedInUser = await User.findById(user._id)
            .populate("organizations", "name slug")
            .select("-password -refreshToken");

        if (loggedInUser) return { accessToken, refreshToken, loggedInUser };
        else return null;
    }

    static async logoutUser(userId) {
        await User.findByIdAndUpdate(userId,
            { $unset: { refreshToken: 1 } },
            { new: true }
        );
    }

    static async getCurrentUser(userId) {
        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user) throw new ApiError(404, "User not found");
        return user;
    }

    static async refreshAccessToken(incomingRefreshToken) {
        try {
            const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
            const user = await User.findById(decodedToken?._id);
            if (!user) {
                throw new ApiError(401, "Invalid refresh token");
            }
            if (incomingRefreshToken !== user?.refreshToken) {
                throw new ApiError(401, "Refresh token is expired or used");
            }
            
            const { accessToken, refreshToken } = await this.generateAccessAndRefreshTokens(user._id);
            return { accessToken, refreshToken };
        } catch (error) {
            throw new ApiError(401, error?.message || "Invalid refresh token");
        }
    }

    static async updateProfile(userId, fullName, username, currentAvatar) {
        const updates = {};
        if (fullName !== undefined) {
            if (fullName.trim() === "") {
                throw new ApiError(400, "Full name cannot be empty");
            }
            updates.fullName = fullName.trim();
        }
        if (username !== undefined) {
            const cleanUsername = username.trim().toLowerCase();
            if (cleanUsername === "") {
                throw new ApiError(400, "Username cannot be empty");
            }
            const existedUser = await User.findOne({ username: cleanUsername });
            if (existedUser && existedUser._id.toString() !== userId.toString()) {
                throw new ApiError(409, "Username is already taken");
            }
            updates.username = cleanUsername;
        }
        if (updates.fullName && currentAvatar && currentAvatar.startsWith("https://ui-avatars.com/")) {
            updates.avatar = `https://api.dicebear.com/7.x/dylan/svg?seed=${encodeURIComponent(updates.fullName)}`;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, {
            $set: updates
        }, {
            new: true
        }).select("-password -refreshToken");

        return updatedUser;
    }

    static async changePassword(userId, oldPassword, newPassword) {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
        if (!isPasswordCorrect) {
            throw new ApiError(400, "Incorrect current password");
        }
        user.password = newPassword;
        await user.save();
    }

    static async completeOnboarding(userId, onboardingData = {}) {
        const { profession, orgAction, orgInput } = onboardingData;
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        
        if (profession) {
            const allowedProfessions = ['Student', 'Employee', 'Freelancer', 'Other'];
            user.profession = allowedProfessions.includes(profession) ? profession : 'Other';
        }

        if (orgAction === "create" && orgInput && orgInput.trim()) {
            const orgName = orgInput.trim();
            const baseSlug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
            let slug = baseSlug || "org";
            let attempts = 0;
            while (await Organization.findOne({ slug }) && attempts < 5) {
                slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
                attempts++;
            }

            const org = await Organization.create({
                name: orgName,
                slug,
                owner: user._id,
                members: [{ user: user._id, role: "Admin" }]
            });

            if (!user.organizations) user.organizations = [];
            user.organizations.push(org._id);
            user.accountType = "organization";
        } else if (orgAction === "join" && orgInput && orgInput.trim()) {
            const query = orgInput.trim();
            const org = await Organization.findOne({
                $or: [
                    { slug: query.toLowerCase() },
                    { name: new RegExp(`^${query}$`, "i") }
                ]
            });

            if (org) {
                const isMember = org.members.some(
                    (m) => m.user.toString() === user._id.toString()
                );
                if (!isMember) {
                    org.members.push({ user: user._id, role: "Member" });
                    await org.save();
                }
                if (!user.organizations) user.organizations = [];
                if (!user.organizations.some((o) => o.toString() === org._id.toString())) {
                    user.organizations.push(org._id);
                }
                user.accountType = "organization";
            }
        }

        user.isOnboarded = true;
        await user.save({ validateBeforeSave: false });
        
        const populatedUser = await User.findById(user._id)
            .populate("organizations", "name slug")
            .select("-password -refreshToken");

        return populatedUser || user;
    }
}

export default UserService;
