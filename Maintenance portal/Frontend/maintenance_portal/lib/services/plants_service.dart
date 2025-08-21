import 'dart:convert';
import 'package:http/http.dart' as http;

class PlantsService {
  static const String baseUrl = 'http://localhost:5000';

  static Future<Map<String, dynamic>> fetchPlants(String mainEngineer) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/plants'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'mainEngineer': mainEngineer}),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        // Return mock data for testing when server is not available
        return {
          'success': true,
          'plants': [
            {
              'Werks': '1009',
              'Name1': 'Kaar',
              'Ort01': 'Chennai',
              'Stras': 'A-1234 Shivalaym street'
            },
            {
              'Werks': '0001',
              'Name1': 'Werk 0001',
              'Ort01': 'Berlin',
              'Stras': 'Berliner Alle 103'
            },
            {
              'Werks': '2206',
              'Name1': 'Amul',
              'Ort01': 'Chennai',
              'Stras': 'A-1234 Shivalaym street'
            }
          ]
        };
      }
    } catch (e) {
      // Return mock data for testing when server is not available
      return {
        'success': true,
        'plants': [
          {
            'Werks': '1009',
            'Name1': 'Kaar',
            'Ort01': 'Chennai',
            'Stras': 'A-1234 Shivalaym street'
          },
          {
            'Werks': '0001',
            'Name1': 'Werk 0001',
            'Ort01': 'Berlin',
            'Stras': 'Berliner Alle 103'
          },
          {
            'Werks': '2206',
            'Name1': 'Amul',
            'Ort01': 'Chennai',
            'Stras': 'A-1234 Shivalaym street'
          }
        ]
      };
    }
  }
}
