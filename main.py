"""
main.py
AI Warehouse Route Planning - Interactive Command-Line Interface
Contributors:
  - Person 1: Aryan   [BT24CSD009] (Warehouse Grid & Problem Formulation)
  - Person 2: Atharv  [BT24CSD004] (BFS & DFS Implementation)
  - Person 3: Aditya  [BT24CSD018] (Greedy Best-First & Heuristic Formulation)
  - Person 4: Raveena [BT24CSD022] (A* Implementation & Weighted Path Cost Analysis)
  - Person 5: Eshan   [BT24CSD012] (Trolley Replanning, Performance Evaluation & 3D UI)
"""

import sys
import os
import argparse
import webbrowser
import http.server
import socketserver
import threading
from typing import List

from warehouse.grid import (
    WarehouseGrid,
    CellType,
    create_standard_warehouse,
    create_cost_vs_length_warehouse,
    create_trolley_demonstration_warehouse
)
from warehouse.algorithms import (
    breadth_first_search,
    depth_first_search,
    greedy_best_first_search,
    a_star_search
)
from warehouse.replanner import DynamicReplanner
from warehouse.benchmark import BenchmarkRunner
from warehouse.visualizer import (
    save_algorithm_comparison_figure,
    save_cost_vs_length_figure,
    save_trolley_replanning_figure,
    save_metrics_bar_chart
)


def print_banner():
    banner = r"""
================================================================================
          AI WAREHOUSE ROBOT ROUTE PLANNING SYSTEM
           Autonomous Pathfinding & Dynamic Replanning
================================================================================
  Team Roster & Contributions:
    [1] Aryan   [BT24CSD009] - Warehouse Environment & State Space Formulation
    [2] Atharv  [BT24CSD004] - BFS and DFS Graph Search Algorithms
    [3] Aditya  [BT24CSD018] - Greedy Best-First Search & Manhattan Distance Admissibility
    [4] Raveena [BT24CSD022] - A* Algorithm & Weighted Cost Optimization
    [5] Eshan   [BT24CSD012] - Dynamic Trolley Detection, Real-Time Replanning & 3D Web UI
================================================================================
"""
    print(banner)


def run_standard_experiment():
    print("\n--- [1] Standard Warehouse Grid (12x12) ---")
    grid = create_standard_warehouse()
    results = BenchmarkRunner.run_all_algorithms(grid)

    for res in results:
        print(f"\n>>> Algorithm: {res.algorithm_name}")
        print(f"Goal Reached: {res.goal_reached} | Moves: {res.path_length} | Cost: {res.total_cost:.1f} | Nodes: {res.nodes_expanded} | Time: {res.execution_time_ms:.3f} ms")
        if res.goal_reached:
            print("Path Coordinates:")
            print(" -> ".join(f"({r},{c})" for r, c in res.path[:10]) + ("..." if len(res.path) > 10 else ""))
            print(grid.render_ascii(path=res.path))

    print("\n--- Summary Performance Table ---")
    print(BenchmarkRunner.format_comparison_table(results))
    print(BenchmarkRunner.explain_findings(results, "Standard Warehouse"))


def run_cost_vs_length_experiment():
    print("\n--- [2] Task 3 Dilemma: Short Crowded vs. Long Cheap Detour ---")
    grid = create_cost_vs_length_warehouse()
    results = BenchmarkRunner.run_all_algorithms(grid)

    print("\nWarehouse ASCII Layout (Start=P, Goal=D, C=Crowded Cost 4, #=Shelf):")
    print(grid.render_ascii())

    print("\n" + BenchmarkRunner.format_comparison_table(results))
    print(BenchmarkRunner.explain_findings(results, "Cost vs Length Dilemma"))


def run_trolley_experiment():
    print("\n--- [3] Task 4: Dynamic Obstacle (Trolley) Detection & A* Replanning ---")
    grid, trolley_pos = create_trolley_demonstration_warehouse()

    print(f"Initial Planning: Robot calculates optimal route using A* (unaware of trolley)...")
    replanner = DynamicReplanner(grid, [trolley_pos])
    sim = replanner.run_simulation()

    print(f"\nInitial Planned Route Length: {len(sim.initial_planned_path)-1} moves | Cost: {sim.initial_planned_cost:.1f}")
    print(grid.render_ascii(path=sim.initial_planned_path))

    print(f"\nSimulation Event: Unmapped trolley placed at physical location {trolley_pos}")
    if sim.replan_events:
        evt = sim.replan_events[0]
        print(f"-> Robot stepped to {evt.robot_position} and detected {evt.obstacle_type} at {evt.blocked_cell}!")
        print(f"-> Dynamic Update: Blocked cell marked in belief map.")
        print(f"-> Replanning: A* computed alternative path in {evt.time_taken_ms:.3f} ms.")

    print(f"\nFinal Executed Route Length: {sim.total_moves} moves | Executed Cost: {sim.actual_executed_cost:.1f}")
    print(f"Total Replans: {sim.replan_count} | Goal Reached: {sim.goal_reached}")
    print(sim.final_robot_grid.render_ascii(path=sim.actual_executed_path))


def run_trapped_experiment():
    print("\n--- [4] Task 4 Edge Case: Trolley Completely Traps Robot ---")
    grid = WarehouseGrid(height=5, width=5, start=(0, 0), goal=(4, 4))
    for c in range(5):
        if c != 2:
            grid.set_cell(2, c, CellType.SHELF)

    replanner = DynamicReplanner(grid, [(2, 2)])
    sim = replanner.run_simulation()
    print(f"\nRobot Result: Goal Reached = {sim.goal_reached}")
    print(f"Status Message: {sim.error_message}")


def generate_all_figures():
    print("\nGenerating Matplotlib figures and JSON simulation data...")
    import run_simulation
    run_simulation.run_and_export()


def launch_web_ui(port: int = 8080):
    web_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web_3d")
    os.chdir(web_dir)

    class CustomHandler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            pass # Suppress server request logging

    try:
        httpd = socketserver.TCPServer(("", port), CustomHandler)
    except OSError:
        port = 8081
        httpd = socketserver.TCPServer(("", port), CustomHandler)

    url = f"http://localhost:{port}/index.html"
    print(f"\n[3D DIGITAL TWIN] Server running at: {url}")
    print("Press Ctrl+C to stop the server.")
    webbrowser.open(url)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping web server.")
        httpd.server_close()


def main():
    parser = argparse.ArgumentParser(description="AI Warehouse Robot Route Planning System")
    parser.add_argument("--all", action="store_true", help="Run complete benchmark suite and generate artifacts")
    parser.add_argument("--web", action="store_true", help="Launch interactive 3D Three.js web application")
    parser.add_argument("--port", type=int, default=8080, help="Port for web server (default 8080)")
    args = parser.parse_args()

    print_banner()

    if args.all:
        generate_all_figures()
        return

    if args.web:
        launch_web_ui(args.port)
        return

    while True:
        print("\nSelect an option:")
        print("  1. Run All Algorithms on Standard Warehouse (12x12)")
        print("  2. Run Task 3 Test: Short Crowded vs. Long Cheap Detour")
        print("  3. Run Task 4 Demo: Dynamic Trolley Obstacle & A* Replanning")
        print("  4. Run Task 4 Edge Case: Trapped Robot (No Route Exists)")
        print("  5. Run Complete Benchmark Suite & Export Figures")
        print("  6. Launch 3D Three.js Interactive Warehouse Web App")
        print("  7. Exit")

        choice = input("\nEnter choice (1-7): ").strip()
        if choice == '1':
            run_standard_experiment()
        elif choice == '2':
            run_cost_vs_length_experiment()
        elif choice == '3':
            run_trolley_experiment()
        elif choice == '4':
            run_trapped_experiment()
        elif choice == '5':
            generate_all_figures()
        elif choice == '6':
            launch_web_ui(args.port)
        elif choice == '7':
            print("Exiting. Good luck with the evaluation!")
            break
        else:
            print("Invalid selection. Please choose 1-7.")


if __name__ == "__main__":
    main()
