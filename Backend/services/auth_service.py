class AuthService:
    _instance = None

    def __init__(self):
        # Example placeholder user data (you can replace later)
        self.users = {"admin": "1234"}

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = AuthService()
        return cls._instance

    def verify_user(self, username, password):
        return self.users.get(username) == password