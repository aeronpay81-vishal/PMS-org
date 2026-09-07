"""
Flask Auth API - Test Suite
Tests all endpoints with proper MVC architecture
"""

import requests
import json
import time

BASE_URL = "http://localhost:5000/api/auth"

# Colors for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
BLUE = '\033[94m'
YELLOW = '\033[93m'
CYAN = '\033[96m'
END = '\033[0m'


def print_header(title):
    """Print formatted header"""
    print(f"\n{BLUE}{'='*70}{END}")
    print(f"{CYAN}{title:^70}{END}")
    print(f"{BLUE}{'='*70}{END}")


def print_request(method, endpoint, data=None, headers=None):
    """Print request details"""
    print(f"\n{YELLOW}➜ {method} {BASE_URL}{endpoint}{END}")
    if data:
        print(f"{YELLOW}📝 Body:{END}")
        print(json.dumps(data, indent=2))
    if headers:
        print(f"{YELLOW}🔐 Headers:{END}")
        for key, value in headers.items():
            if key == 'Authorization':
                print(f"  {key}: Bearer {value[:20]}...")
            else:
                print(f"  {key}: {value}")


def print_response(status_code, data):
    """Print response details"""
    color = GREEN if status_code < 400 else RED
    print(f"\n{color}✓ Status: {status_code}{END}")
    print(f"{YELLOW}📊 Response:{END}")
    print(json.dumps(data, indent=2))


def test_signup():
    """Test user signup"""
    print_header("TEST 1: USER SIGNUP")
    
    endpoint = "/signup"
    data = {
        "username": f"testuser_{int(time.time())}",
        "email": f"testuser_{int(time.time())}@example.com",
        "password": "testpass123",
        "full_name": "Test User"
    }
    
    print_request("POST", endpoint, data)
    
    response = requests.post(f"{BASE_URL}{endpoint}", json=data)
    result = response.json()
    
    print_response(response.status_code, result)
    
    if response.status_code == 201 and result.get('success'):
        print(f"\n{GREEN}✓ Signup successful!{END}")
        return result['data']
    else:
        print(f"\n{RED}✗ Signup failed!{END}")
        return None


def test_login(email, password):
    """Test user login"""
    print_header("TEST 2: USER LOGIN")
    
    endpoint = "/login"
    data = {
        "email": email,
        "password": password
    }
    
    print_request("POST", endpoint, data)
    
    response = requests.post(f"{BASE_URL}{endpoint}", json=data)
    result = response.json()
    
    print_response(response.status_code, result)
    
    if response.status_code == 200 and result.get('success'):
        print(f"\n{GREEN}✓ Login successful!{END}")
        return result['data']
    else:
        print(f"\n{RED}✗ Login failed!{END}")
        return None


def test_get_me(access_token):
    """Test get current user"""
    print_header("TEST 3: GET CURRENT USER")
    
    endpoint = "/me"
    headers = {"Authorization": f"Bearer {access_token}"}
    
    print_request("GET", endpoint, headers=headers)
    
    response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
    result = response.json()
    
    print_response(response.status_code, result)
    
    if response.status_code == 200 and result.get('success'):
        print(f"\n{GREEN}✓ Retrieved user info!{END}")
        return result['data']['user']
    else:
        print(f"\n{RED}✗ Failed to retrieve user info!{END}")
        return None


def test_refresh_token(refresh_token):
    """Test token refresh"""
    print_header("TEST 4: REFRESH TOKEN")
    
    endpoint = "/refresh"
    headers = {"Authorization": f"Bearer {refresh_token}"}
    
    print_request("POST", endpoint, headers=headers)
    
    response = requests.post(f"{BASE_URL}{endpoint}", headers=headers)
    result = response.json()
    
    print_response(response.status_code, result)
    
    if response.status_code == 200 and result.get('success'):
        print(f"\n{GREEN}✓ Token refreshed!{END}")
        return result['data']['access_token']
    else:
        print(f"\n{RED}✗ Token refresh failed!{END}")
        return None


def test_logout(access_token):
    """Test user logout"""
    print_header("TEST 5: USER LOGOUT")
    
    endpoint = "/logout"
    headers = {"Authorization": f"Bearer {access_token}"}
    
    print_request("POST", endpoint, headers=headers)
    
    response = requests.post(f"{BASE_URL}{endpoint}", headers=headers)
    result = response.json()
    
    print_response(response.status_code, result)
    
    if response.status_code == 200 and result.get('success'):
        print(f"\n{GREEN}✓ Logout successful!{END}")
        return True
    else:
        print(f"\n{RED}✗ Logout failed!{END}")
        return False


def test_invalid_token():
    """Test invalid token handling"""
    print_header("TEST 6: INVALID TOKEN HANDLING")
    
    endpoint = "/me"
    headers = {"Authorization": "Bearer invalid_token"}
    
    print_request("GET", endpoint, headers=headers)
    
    response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
    result = response.json()
    
    print_response(response.status_code, result)
    
    if response.status_code == 401:
        print(f"\n{GREEN}✓ Invalid token properly rejected!{END}")
        return True
    else:
        print(f"\n{RED}✗ Invalid token not handled!{END}")
        return False


def test_duplicate_signup(email):
    """Test duplicate email handling"""
    print_header("TEST 7: DUPLICATE EMAIL HANDLING")
    
    endpoint = "/signup"
    data = {
        "username": "anotheruser",
        "email": email,
        "password": "testpass123",
        "full_name": "Another User"
    }
    
    print_request("POST", endpoint, data)
    
    response = requests.post(f"{BASE_URL}{endpoint}", json=data)
    result = response.json()
    
    print_response(response.status_code, result)
    
    if response.status_code == 400 and not result.get('success'):
        print(f"\n{GREEN}✓ Duplicate email properly rejected!{END}")
        return True
    else:
        print(f"\n{RED}✗ Duplicate email not handled!{END}")
        return False


def run_all_tests():
    """Run all tests"""
    print_header("FLASK AUTH API - COMPLETE TEST SUITE (MVC ARCHITECTURE)")
    print(f"\n{CYAN}Testing at: {BASE_URL}{END}")
    
    tests_passed = 0
    tests_failed = 0
    
    try:
        # Test 1: Signup
        signup_data = test_signup()
        if signup_data:
            tests_passed += 1
            access_token = signup_data['access_token']
            refresh_token = signup_data['refresh_token']
            user_email = signup_data['user']['email']
        else:
            tests_failed += 1
            return
        
        # Test 2: Login
        login_data = test_login(user_email, "testpass123")
        if login_data:
            tests_passed += 1
            access_token = login_data['access_token']
            refresh_token = login_data['refresh_token']
        else:
            tests_failed += 1
        
        # Test 3: Get Current User
        user_info = test_get_me(access_token)
        if user_info:
            tests_passed += 1
        else:
            tests_failed += 1
        
        # Test 4: Refresh Token
        new_token = test_refresh_token(refresh_token)
        if new_token:
            tests_passed += 1
            access_token = new_token
        else:
            tests_failed += 1
        
        # Test 5: Logout
        if test_logout(access_token):
            tests_passed += 1
        else:
            tests_failed += 1
        
        # Test 6: Invalid Token
        if test_invalid_token():
            tests_passed += 1
        else:
            tests_failed += 1
        
        # Test 7: Duplicate Email
        if test_duplicate_signup(user_email):
            tests_passed += 1
        else:
            tests_failed += 1
        
        # Summary
        print_header("TEST SUMMARY")
        print(f"\n{GREEN}✓ Passed: {tests_passed}{END}")
        print(f"{RED}✗ Failed: {tests_failed}{END}")
        print(f"\n{CYAN}Total: {tests_passed + tests_failed}{END}")
        
        if tests_failed == 0:
            print(f"\n{GREEN}{'='*70}{END}")
            print(f"{GREEN}{'ALL TESTS PASSED! 🎉':^70}{END}")
            print(f"{GREEN}{'='*70}{END}\n")
        else:
            print(f"\n{YELLOW}{'='*70}{END}")
            print(f"{YELLOW}{'SOME TESTS FAILED ⚠️':^70}{END}")
            print(f"{YELLOW}{'='*70}{END}\n")
    
    except requests.exceptions.ConnectionError:
        print(f"\n{RED}{'='*70}{END}")
        print(f"{RED}{'ERROR: Could not connect to server':^70}{END}")
        print(f"{RED}{'='*70}{END}")
        print(f"\n{YELLOW}Make sure Flask is running:{END}")
        print(f"  python run.py\n")
    except Exception as e:
        print(f"\n{RED}{'='*70}{END}")
        print(f"{RED}ERROR: {str(e)}{END}")
        print(f"{RED}{'='*70}{END}\n")


if __name__ == "__main__":
    run_all_tests()
