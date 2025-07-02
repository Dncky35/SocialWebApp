from passlib.hash import pbkdf2_sha256


def hash_password(password:str):
    return pbkdf2_sha256.hash(password)

def verify_password(password:str, hashed_password:str):
    return pbkdf2_sha256.verify(password, hashed_password)

ROLE_HIERARCHY = ["user", "moderator", "admin", "superadmin"]

def get_next_role(current_role:str, promote=True) -> str:
    try:
        idx = ROLE_HIERARCHY.index(current_role)
        if promote:
            return ROLE_HIERARCHY[idx + 1] if idx + 1 < len(ROLE_HIERARCHY) else current_role
        else:
            return ROLE_HIERARCHY[idx - 1] if idx > 0 else current_role
    except ValueError:
        return current_role