import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.main import app
from backend.database import get_db, Base
from backend.models import User
from backend.auth_enhanced import get_password_hash, create_access_token

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client():
    return TestClient(app)


@pytest.fixture(scope="function")
def test_user(db_session):
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password=get_password_hash("SecurePass123!"),
        role="admin",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


class TestAuthentication:
    """Test authentication endpoints"""

    def test_register_user_success(self, client):
        """Test successful user registration"""
        response = client.post("/auth/register", json={
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "SecurePass123!",
            "role": "staff"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "newuser"
        assert data["email"] == "newuser@example.com"
        assert "hashed_password" not in data

    def test_register_user_weak_password(self, client):
        """Test registration with weak password"""
        response = client.post("/auth/register", json={
            "username": "weakuser",
            "email": "weak@example.com",
            "password": "123",
            "role": "staff"
        })
        assert response.status_code == 422

    def test_register_user_invalid_email(self, client):
        """Test registration with invalid email"""
        response = client.post("/auth/register", json={
            "username": "invaliduser",
            "email": "invalid-email",
            "password": "SecurePass123!",
            "role": "staff"
        })
        assert response.status_code == 422

    def test_login_success(self, client, test_user):
        """Test successful login"""
        response = client.post("/auth/login", data={
            "username": "testuser",
            "password": "SecurePass123!"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials"""
        response = client.post("/auth/login", data={
            "username": "wronguser",
            "password": "wrongpassword"
        })
        assert response.status_code == 401

    def test_login_inactive_user(self, client, db_session):
        """Test login with inactive user"""
        user = User(
            username="inactiveuser",
            email="inactive@example.com",
            hashed_password=get_password_hash("SecurePass123!"),
            role="staff",
            is_active=False
        )
        db_session.add(user)
        db_session.commit()

        response = client.post("/auth/login", data={
            "username": "inactiveuser",
            "password": "SecurePass123!"
        })
        assert response.status_code == 401

    def test_get_current_user(self, client, test_user):
        """Test getting current user info"""
        access_token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {access_token}"}
        
        response = client.get("/auth/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"

    def test_get_current_user_invalid_token(self, client):
        """Test getting current user with invalid token"""
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/auth/me", headers=headers)
        assert response.status_code == 401

    def test_change_password(self, client, test_user):
        """Test changing password"""
        access_token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {access_token}"}
        
        response = client.post("/auth/change-password", json={
            "current_password": "SecurePass123!",
            "new_password": "NewSecurePass456!"
        }, headers=headers)
        assert response.status_code == 200

    def test_change_password_wrong_current(self, client, test_user):
        """Test changing password with wrong current password"""
        access_token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {access_token}"}
        
        response = client.post("/auth/change-password", json={
            "current_password": "WrongPassword",
            "new_password": "NewSecurePass456!"
        }, headers=headers)
        assert response.status_code == 400

    def test_mfa_setup(self, client, test_user):
        """Test MFA setup"""
        access_token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {access_token}"}
        
        response = client.post("/auth/mfa/setup", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "qr_code" in data
        assert "secret" in data

    def test_mfa_verify(self, client, test_user, db_session):
        """Test MFA verification"""
        # Setup MFA first
        test_user.mfa_enabled = True
        test_user.mfa_secret = "test_secret"
        db_session.commit()
        
        access_token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {access_token}"}
        
        response = client.post("/auth/mfa/verify", json={
            "token": "123456"
        }, headers=headers)
        # This will fail with invalid token, but should return 400 not 500
        assert response.status_code in [400, 422]

    def test_logout(self, client, test_user):
        """Test logout"""
        access_token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {access_token}"}
        
        response = client.post("/auth/logout", headers=headers)
        assert response.status_code == 200

    def test_refresh_token(self, client, test_user):
        """Test token refresh"""
        access_token = create_access_token(data={"sub": test_user.username})
        headers = {"Authorization": f"Bearer {access_token}"}
        
        response = client.post("/auth/refresh", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 