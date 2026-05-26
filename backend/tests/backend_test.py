"""
Backend API tests for Football Predictions app.
Covers: health, config, auth (signup/login/me), games (vip lock/unlock,
premium, fixed_odds, results), admin CRUD (games/users/stats/contact),
contact submit, and payment initialize (placeholder → 503).
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://odds-forecast-25.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@footballpredictions.com"
ADMIN_PASSWORD = "Admin@123"


# ---------- Fixtures ----------
@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["user"]["role"] == "admin"
    return data["token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


@pytest.fixture(scope="session")
def user_creds():
    suffix = uuid.uuid4().hex[:8]
    return {"name": "TEST User", "email": f"test_{suffix}@example.com", "password": "Passw0rd!"}


@pytest.fixture(scope="session")
def user_token(session, user_creds):
    r = session.post(f"{API}/auth/signup", json=user_creds)
    assert r.status_code == 200, f"signup failed: {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def user_headers(user_token):
    return {"Authorization": f"Bearer {user_token}", "Content-Type": "application/json"}


# ---------- Health & Config ----------
class TestHealthConfig:
    def test_root(self, session):
        r = session.get(f"{API}/")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"

    def test_config(self, session):
        r = session.get(f"{API}/config")
        assert r.status_code == 200
        data = r.json()
        assert data["vip_price_ghs"] == 50
        assert data["currency"] == "GHS"
        assert "paystack_public_key" in data and data["paystack_public_key"]


# ---------- Auth ----------
class TestAuth:
    def test_signup_creates_user(self, session, user_token, user_creds):
        # token created via fixture, fetch me
        r = session.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {user_token}"})
        assert r.status_code == 200
        me = r.json()
        assert me["email"] == user_creds["email"].lower()
        assert me["role"] == "user"
        assert me["vip_active"] is False

    def test_duplicate_signup_rejected(self, session, user_creds):
        r = session.post(f"{API}/auth/signup", json=user_creds)
        assert r.status_code == 400
        assert "already" in r.json().get("detail", "").lower()

    def test_admin_login_role(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        data = r.json()
        assert data["user"]["role"] == "admin"
        assert isinstance(data["token"], str) and len(data["token"]) > 10

    def test_login_invalid(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_me_no_token(self, session):
        r = session.get(f"{API}/auth/me")
        assert r.status_code == 401


# ---------- Games ----------
class TestGames:
    def test_vip_locked_anonymous(self, session):
        r = session.get(f"{API}/games", params={"category": "vip"})
        assert r.status_code == 200
        games = r.json()
        assert len(games) > 0, "expected seeded VIP games"
        for g in games:
            assert g["category"] == "vip"
            assert g["locked"] is True
            assert g["prediction"] is None

    def test_vip_unlocked_admin(self, session, admin_headers):
        r = session.get(f"{API}/games", params={"category": "vip"}, headers=admin_headers)
        assert r.status_code == 200
        games = r.json()
        assert len(games) > 0
        assert any(g["prediction"] for g in games), "admin should see predictions"
        for g in games:
            assert g["locked"] is False

    def test_premium_visible(self, session):
        r = session.get(f"{API}/games", params={"category": "premium"})
        assert r.status_code == 200
        games = r.json()
        assert len(games) > 0
        for g in games:
            assert g["category"] == "premium"
            assert g["locked"] is False
            assert g["prediction"]  # not null/empty

    def test_fixed_odds_visible(self, session):
        r = session.get(f"{API}/games", params={"category": "fixed_odds"})
        assert r.status_code == 200
        games = r.json()
        assert len(games) > 0
        for g in games:
            assert g["category"] == "fixed_odds"
            assert g["locked"] is False
            assert g["prediction"]

    def test_results(self, session):
        r = session.get(f"{API}/games/results")
        assert r.status_code == 200
        results = r.json()
        assert len(results) > 0
        for g in results:
            assert g["status"] in ("won", "lost")
            assert g["prediction"]  # results reveal prediction
            assert g.get("score")


# ---------- Admin CRUD ----------
class TestAdminGames:
    created_id = None

    def test_create_game_requires_admin(self, session, user_headers):
        payload = {
            "home_team": "TEST_H", "away_team": "TEST_A", "league": "TEST League",
            "match_date": "2026-02-01T18:00:00+00:00", "prediction": "Home Win",
            "odds": 1.9, "category": "premium", "confidence": 80, "notes": "TEST",
        }
        r = session.post(f"{API}/admin/games", json=payload, headers=user_headers)
        assert r.status_code == 403

    def test_create_game_admin(self, session, admin_headers):
        payload = {
            "home_team": "TEST_Home", "away_team": "TEST_Away", "league": "TEST League",
            "match_date": "2026-02-01T18:00:00+00:00", "prediction": "Over 2.5",
            "odds": 2.0, "category": "vip", "confidence": 85, "notes": "TEST note",
        }
        r = session.post(f"{API}/admin/games", json=payload, headers=admin_headers)
        assert r.status_code == 200
        g = r.json()
        assert g["home_team"] == "TEST_Home"
        assert g["category"] == "vip"
        assert g["prediction"] == "Over 2.5"
        assert g["status"] == "pending"
        TestAdminGames.created_id = g["id"]

        # GET verify persistence
        r2 = session.get(f"{API}/games", params={"category": "vip"}, headers=admin_headers)
        assert any(x["id"] == g["id"] for x in r2.json())

    def test_update_game(self, session, admin_headers):
        gid = TestAdminGames.created_id
        assert gid, "create_game must run first"
        r = session.put(f"{API}/admin/games/{gid}",
                        json={"status": "won", "score": "3-1"}, headers=admin_headers)
        assert r.status_code == 200
        updated = r.json()
        assert updated["status"] == "won"
        assert updated["score"] == "3-1"

    def test_delete_game(self, session, admin_headers):
        gid = TestAdminGames.created_id
        r = session.delete(f"{API}/admin/games/{gid}", headers=admin_headers)
        assert r.status_code == 200
        # delete again → 404
        r2 = session.delete(f"{API}/admin/games/{gid}", headers=admin_headers)
        assert r2.status_code == 404


class TestAdminMisc:
    def test_users_admin_only(self, session, user_headers, admin_headers):
        r_user = session.get(f"{API}/admin/users", headers=user_headers)
        assert r_user.status_code == 403
        r = session.get(f"{API}/admin/users", headers=admin_headers)
        assert r.status_code == 200
        users = r.json()
        assert isinstance(users, list) and len(users) >= 1
        assert any(u["email"] == ADMIN_EMAIL for u in users)

    def test_stats(self, session, admin_headers):
        r = session.get(f"{API}/admin/stats", headers=admin_headers)
        assert r.status_code == 200
        s = r.json()
        for k in ("total_users", "vip_users", "total_games", "games_won", "games_lost", "successful_payments"):
            assert k in s
            assert isinstance(s[k], int)


# ---------- Contact ----------
class TestContact:
    def test_submit_contact(self, session, admin_headers):
        msg = {"name": "TEST Sender", "email": "test_contact@example.com",
               "subject": "TEST Subject", "message": "TEST message body"}
        r = session.post(f"{API}/contact", json=msg)
        assert r.status_code == 200
        assert r.json()["status"] == "received"

        # admin can list
        r2 = session.get(f"{API}/admin/contact-messages", headers=admin_headers)
        assert r2.status_code == 200
        msgs = r2.json()
        assert any(m["subject"] == "TEST Subject" for m in msgs)


# ---------- Payment ----------
class TestPayment:
    def test_initialize_returns_503_placeholder(self, session, user_headers):
        r = session.post(f"{API}/payment/initialize",
                         json={"callback_url": "https://example.com/cb"},
                         headers=user_headers)
        assert r.status_code == 503
        detail = r.json().get("detail", "")
        assert "not configured" in detail.lower()

    def test_initialize_unauthenticated(self, session):
        r = session.post(f"{API}/payment/initialize", json={"callback_url": "https://example.com/cb"})
        assert r.status_code == 401
