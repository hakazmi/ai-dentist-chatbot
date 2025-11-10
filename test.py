import requests
import json
from pathlib import Path
import time

# Base URL for the API
BASE_URL = "http://localhost:8000"

def print_separator():
    print("\n" + "="*70 + "\n")

def test_health_check():
    """Test 1: Health check endpoint"""
    print("TEST 1: Health Check")
    print_separator()
    
    response = requests.get(f"{BASE_URL}/")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    assert response.status_code == 200, "Health check failed"
    print("✅ Health check passed!")

def test_upload_xray(image_path: str):
    """Test 2: Upload and analyze X-ray"""
    print("TEST 2: Upload X-ray Image")
    print_separator()
    
    if not Path(image_path).exists():
        print(f"❌ Image file not found: {image_path}")
        print("Please provide a valid X-ray image path")
        return None
    
    with open(image_path, 'rb') as f:
        files = {'file': (Path(image_path).name, f, 'image/jpeg')}
        
        print(f"Uploading: {image_path}")
        print("Please wait, this may take a few seconds...")
        
        response = requests.post(f"{BASE_URL}/api/upload-xray", files=files)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print("\n📊 Analysis Results:")
        print(f"Success: {result['success']}")
        print(f"Message: {result['message']}")
        print(f"\nDetections: {json.dumps(result['detections'], indent=2)}")
        print(f"\nAnalysis Summary:\n{result['analysis_summary']}")
        print(f"\nOutput Image: {result['output_image_path']}")
        print("✅ Upload and analysis passed!")
        return result
    else:
        print(f"❌ Upload failed: {response.text}")
        return None

def test_chat(message: str, session_id: str = "test_session"):
    """Test 3: Chat with dental assistant"""
    print(f"TEST 3: Chat - '{message}'")
    print_separator()
    
    payload = {
        "message": message,
        "session_id": session_id
    }
    
    response = requests.post(f"{BASE_URL}/api/chat", json=payload)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"\n🤖 Assistant Response:\n{result['response']}")
        print(f"\nSession ID: {result['session_id']}")
        print("✅ Chat passed!")
    else:
        print(f"❌ Chat failed: {response.text}")

def test_get_image(output_image_path: str):
    """Test 4: Retrieve analyzed image"""
    print("TEST 4: Get Analyzed Image")
    print_separator()
    
    response = requests.get(f"{BASE_URL}/api/image/{output_image_path}")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        # Save the image locally to verify
        save_path = Path("test_output") / output_image_path
        save_path.parent.mkdir(exist_ok=True)
        
        with open(save_path, 'wb') as f:
            f.write(response.content)
        
        print(f"✅ Image retrieved and saved to: {save_path}")
    else:
        print(f"❌ Image retrieval failed: {response.text}")

def test_current_analysis():
    """Test 5: Get current analysis"""
    print("TEST 5: Get Current Analysis")
    print_separator()
    
    response = requests.get(f"{BASE_URL}/api/current-analysis")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    assert response.status_code == 200, "Current analysis check failed"
    print("✅ Current analysis check passed!")

def test_clear_session(session_id: str = "test_session"):
    """Test 6: Clear session history"""
    print("TEST 6: Clear Session History")
    print_separator()
    
    response = requests.delete(f"{BASE_URL}/api/clear-session/{session_id}")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    assert response.status_code == 200, "Clear session failed"
    print("✅ Clear session passed!")

def run_all_tests():
    """Run all tests in sequence"""
    print("\n" + "🧪 STARTING DENTAL CHATBOT BACKEND TESTS ".center(70, "="))
    print_separator()
    
    try:
        # Test 1: Health check
        test_health_check()
        time.sleep(1)
        
        # Test 2: Upload X-ray (CHANGE THIS PATH TO YOUR IMAGE)
        image_path = "tooth.jpg"  # 👈 Change this to your X-ray image path
        print(f"\n📝 Note: Using image path: {image_path}")
        print("If the image doesn't exist, please update the path in test.py")
        
        analysis_result = test_upload_xray(image_path)
        
        if analysis_result:
            time.sleep(1)
            
            # Test 3: Chat tests
            test_chat("What did you find in my X-ray?")
            time.sleep(1)
            
            test_chat("What is a fractured tooth?")
            time.sleep(1)
            
            test_chat("Should I be worried about the findings?")
            time.sleep(1)
            
            # Test 4: Get image
            test_get_image(analysis_result['output_image_path'])
            time.sleep(1)
            
            # Test 5: Get current analysis
            test_current_analysis()
            time.sleep(1)
            
            # Test 6: Clear session
            test_clear_session()
        
        print_separator()
        print("🎉 ALL TESTS COMPLETED SUCCESSFULLY!".center(70))
        print_separator()
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to the server!")
        print("Please make sure the FastAPI server is running:")
        print("  python main.py")
        print("\nOr run with: uvicorn main:app --reload")
    except Exception as e:
        print(f"\n❌ TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()

def interactive_test():
    """Interactive testing mode"""
    print("\n" + "🔧 INTERACTIVE TEST MODE ".center(70, "="))
    print("\nAvailable tests:")
    print("1. Health Check")
    print("2. Upload X-ray")
    print("3. Chat")
    print("4. Get Current Analysis")
    print("5. Clear Session")
    print("6. Run All Tests")
    print("0. Exit")
    
    while True:
        choice = input("\nSelect test number (0-6): ").strip()
        
        if choice == "0":
            print("👋 Exiting...")
            break
        elif choice == "1":
            test_health_check()
        elif choice == "2":
            path = input("Enter X-ray image path: ").strip()
            test_upload_xray(path)
        elif choice == "3":
            message = input("Enter your message: ").strip()
            test_chat(message)
        elif choice == "4":
            test_current_analysis()
        elif choice == "5":
            session = input("Enter session ID (default: test_session): ").strip() or "test_session"
            test_clear_session(session)
        elif choice == "6":
            run_all_tests()
            break
        else:
            print("Invalid choice, please try again")

if __name__ == "__main__":
    import sys
    
    print("\n" + "🏥 DENTAL CHATBOT BACKEND TESTER ".center(70, "="))
    print("\nMake sure the FastAPI server is running on http://localhost:8000")
    print("Start server with: python main.py")
    print_separator()
    
    if len(sys.argv) > 1 and sys.argv[1] == "--interactive":
        interactive_test()
    else:
        run_all_tests()