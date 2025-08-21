//workorders_service.dart
// lib/services/workorders_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'api_base.dart';

class WorkOrdersService {
  static Future<List<dynamic>> fetchWorkOrders(String plant) async {
    final url = Uri.parse('${ApiBase.baseUrl}/workorders');
    try {
      final res = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'plant': plant}),
      );

      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        return (data['workorders'] as List?) ?? [];
      } else {
        // helpful debug
        // ignore: avoid_print
        print('WorkOrders error ${res.statusCode}: ${res.body}');
        return [];
      }
    } catch (e) {
      // ignore: avoid_print
      print('WorkOrders exception: $e');
      return [];
    }
  }
}
























// import 'dart:convert';
// import 'package:http/http.dart' as http;

// class WorkOrdersService {
//   static const String baseUrl = 'http://10.0.2.2:5000'; // adjust for your env

//   static Future<Map<String, dynamic>> fetchWorkOrders(String plant) async {
//     try {
//       final response = await http.post(
//         Uri.parse('$baseUrl/workorders'),
//         headers: {'Content-Type': 'application/json'},
//         body: json.encode({'plant': plant}),
//       );

//       if (response.statusCode == 200) {
//         return json.decode(response.body);
//       } else {
//         return {'success': false, 'workorders': []};
//       }
//     } catch (e) {
//       return {'success': false, 'workorders': []};
//     }
//   }
// }
