// lib/services/api_base.dart
import 'package:flutter/foundation.dart' show kIsWeb;

class ApiBase {
  static String get baseUrl {
    if (kIsWeb) {
      // Flutter Web → browser → same PC as Node
      return 'http://localhost:5000';
    } else {
      // Android emulator → 10.0.2.2 = "host machine localhost"
      return 'http://10.0.2.2:5000';
      
      // If you run on a real phone connected via Wi-Fi:
      // return 'http://<YOUR_PC_IP>:5000';
    }
  }
}
