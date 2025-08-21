import 'package:flutter/material.dart';
import 'package:maintenance_portal/services/plants_service.dart';
import 'dashboard_screen.dart';


class PlantsScreen extends StatefulWidget {
  final String employeeId;

  const PlantsScreen({Key? key, required this.employeeId}) : super(key: key);

  @override
  _PlantsScreenState createState() => _PlantsScreenState();
}

class _PlantsScreenState extends State<PlantsScreen> {
  late Future<Map<String, dynamic>> _plantsFuture;
  List<dynamic> plants = [];

  @override
  void initState() {
    super.initState();
    _plantsFuture = PlantsService.fetchPlants(widget.employeeId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background with image
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFFE1E8F0),
              image: DecorationImage(
                image: AssetImage('Assets/Background-image.png'),
                fit: BoxFit.cover,
                colorFilter: ColorFilter.mode(
                  Colors.white.withOpacity(0.1),
                  BlendMode.dstATop,
                ),
              ),
            ),
          ),
          // Main content
          SafeArea(
            child: Column(
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    children: [
                      IconButton(
                        icon: Icon(Icons.arrow_back, color: Color(0xFF9068BE)),
                        onPressed: () => Navigator.pop(context),
                      ),
                      const SizedBox(width: 10),
                      const Text(
                        'My Plants',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF9068BE),
                        ),
                      ),
                    ],
                  ),
                ),
                // Plants list
                Expanded(
                  child: FutureBuilder<Map<String, dynamic>>(
                    future: _plantsFuture,
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Center(
                          child: CircularProgressIndicator(
                            color: Color(0xFF7DCE94),
                          ),
                        );
                      } else if (snapshot.hasError) {
                        return Center(
                          child: Text(
                            'Error: ${snapshot.error}',
                            style: const TextStyle(color: Colors.red),
                          ),
                        );
                      } else if (!snapshot.hasData || 
                          snapshot.data!['success'] == false || 
                          snapshot.data!['plants'].isEmpty) {
                        return const Center(
                          child: Text(
                            'No plants found',
                            style: TextStyle(
                              fontSize: 18,
                              color: Color(0xFF9068BE),
                            ),
                          ),
                        );
                      } else {
                        plants = snapshot.data!['plants'];
                        return ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: plants.length,
                          itemBuilder: (context, index) {
                            final plant = plants[index];
                            return _buildPlantCard(plant);
                          },
                        );
                      }
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Widget _buildPlantCard(Map<String, dynamic> plant) {
  //   return Container(
  //     margin: const EdgeInsets.only(bottom: 16),
  //     decoration: BoxDecoration(
  //       color: Colors.white,
  //       borderRadius: BorderRadius.circular(15),
  //       boxShadow: [
  //         BoxShadow(
  //           color: Colors.grey.withOpacity(0.2),
  //           spreadRadius: 2,
  //           blurRadius: 5,
  //           offset: const Offset(0, 3),
  //         ),
  //       ],
  //     ),
  //     child: Padding(
  //       padding: const EdgeInsets.all(16),
  //       child: Column(
  //         crossAxisAlignment: CrossAxisAlignment.start,
  //         children: [
  //           Row(
  //             children: [
  //               Container(
  //                 padding: const EdgeInsets.all(8),
  //                 decoration: BoxDecoration(
  //                   color: const Color(0xFF7DCE94).withOpacity(0.1),
  //                   borderRadius: BorderRadius.circular(8),
  //                 ),
  //                 child: const Icon(
  //                   Icons.factory,
  //                   color: Color(0xFF7DCE94),
  //                   size: 24,
  //                 ),
  //               ),
  //               const SizedBox(width: 12),
  //               Expanded(
  //                 child: Column(
  //                   crossAxisAlignment: CrossAxisAlignment.start,
  //                   children: [
  //                     Text(
  //                       plant['Name1'] ?? 'Plant Name',
  //                       style: const TextStyle(
  //                         fontSize: 18,
  //                         fontWeight: FontWeight.bold,
  //                         color: Color(0xFF9068BE),
  //                       ),
  //                     ),
  //                     Text(
  //                       'Plant Code: ${plant['Werks'] ?? 'N/A'}',
  //                       style: const TextStyle(
  //                         fontSize: 14,
  //                         color: Colors.grey,
  //                       ),
  //                     ),
  //                   ],
  //                 ),
  //               ),
  //             ],
  //           ),
  //           const SizedBox(height: 12),
  //           _buildInfoRow(Icons.location_on, plant['Ort01'] ?? 'Location N/A'),
  //           const SizedBox(height: 8),
  //           _buildInfoRow(Icons.home, plant['Stras'] ?? 'Address N/A'),
  //         ],
  //       ),
  //     ),
  //   );
  // }
  Widget _buildPlantCard(Map<String, dynamic> plant) {
  return InkWell(
    onTap: () {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => DashboardScreen(
            plantCode: plant['Werks'],
            plantName: plant['Name1'],
          ),
        ),
      );
    },
    child: Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2),
            spreadRadius: 2,
            blurRadius: 5,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF7DCE94).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.factory, color: Color(0xFF7DCE94), size: 24),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        plant['Name1'] ?? 'Plant Name',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF9068BE),
                        ),
                      ),
                      Text(
                        'Plant Code: ${plant['Werks'] ?? 'N/A'}',
                        style: const TextStyle(fontSize: 14, color: Colors.grey),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _buildInfoRow(Icons.location_on, plant['Ort01'] ?? 'Location N/A'),
            const SizedBox(height: 8),
            _buildInfoRow(Icons.home, plant['Stras'] ?? 'Address N/A'),
          ],
        ),
      ),
    ),
  );
}


  Widget _buildInfoRow(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 16, color: const Color(0xFF6ED3CF)),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 14,
              color: Colors.grey,
            ),
          ),
        ),
      ],
    );
  }
}
