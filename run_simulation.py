"""
run_simulation.py
Automated Simulation Runner & Artifact Generator
Author: Person 5 - Eshan [BT24CSD012]

Executes the entire suite of warehouse simulations, prints formatted comparison
tables, answers all problem statement questions, generates Matplotlib figures
for submission documentation, and exports JSON traces for the 3D Three.js digital twin.
"""

import os
import json
import sys
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


def run_and_export():
    print("=" * 80)
    print("AI WAREHOUSE ROBOT ROUTE PLANNING - FULL SIMULATION & EVALUATION")
    print("=" * 80)
    print("Group Members & Responsibilities:")
    print("  * Person 1: Aryan   [BT24CSD009] - Warehouse Grid & Search Problem Formulation (Tasks 1 & 2)")
    print("  * Person 2: Atharv  [BT24CSD004] - BFS and DFS Search Implementations (Task 3)")
    print("  * Person 3: Aditya  [BT24CSD018] - Greedy Best-First Search & Manhattan Heuristic (Task 3)")
    print("  * Person 4: Raveena [BT24CSD022] - A* Implementation & Weighted Path Cost Analysis (Task 3)")
    print("  * Person 5: Eshan   [BT24CSD012] - Dynamic Trolley Replanning, Benchmarking & 3D UI (Tasks 4 & 5)")
    print("=" * 80)

    figures_dir = os.path.join(os.path.dirname(__file__), "docs", "figures")
    os.makedirs(figures_dir, exist_ok=True)
    web_dir = os.path.join(os.path.dirname(__file__), "web_3d")
    os.makedirs(web_dir, exist_ok=True)

    export_payload = {}

    # -------------------------------------------------------------
    # 1. Standard Warehouse 12x12 Layout
    # -------------------------------------------------------------
    print("\n[EXPERIMENT 1] Standard Warehouse Grid (12x12)")
    std_grid = create_standard_warehouse()
    std_results = BenchmarkRunner.run_all_algorithms(std_grid)

    print("\nASCII Map with A* Optimal Route (*):")
    astar_res = next(r for r in std_results if r.algorithm_name == "A*")
    print(std_grid.render_ascii(path=astar_res.path))

    print("\nComparison Table:")
    std_table = BenchmarkRunner.format_comparison_table(std_results)
    print(std_table)
    std_explanation = BenchmarkRunner.explain_findings(std_results, "Standard Warehouse")
    print(std_explanation)

    comp_fig = save_algorithm_comparison_figure(
        std_grid, std_results, os.path.join(figures_dir, "standard_warehouse_comparison.png")
    )
    bar_fig = save_metrics_bar_chart(
        std_results, os.path.join(figures_dir, "metrics_bar_chart.png")
    )
    print(f"-> Saved: {comp_fig}")
    print(f"-> Saved: {bar_fig}")

    export_payload["standard_warehouse"] = {
        "grid": std_grid.to_dict(),
        "algorithms": {res.algorithm_name: res.to_dict() for res in std_results}
    }

    # -------------------------------------------------------------
    # 2. Short Crowded vs Long Cheap Route (Task 3 Requirement)
    # -------------------------------------------------------------
    print("\n" + "=" * 80)
    print("[EXPERIMENT 2] Task 3 Dilemma: Short Crowded Route vs Long Less Costly Detour")
    print("=" * 80)
    cost_grid = create_cost_vs_length_warehouse()
    cost_results = BenchmarkRunner.run_all_algorithms(cost_grid)

    print("\nComparison Table (Cost vs Length):")
    cost_table = BenchmarkRunner.format_comparison_table(cost_results)
    print(cost_table)
    cost_explanation = BenchmarkRunner.explain_findings(cost_results, "Short Crowded vs Long Cheap Corridor")
    print(cost_explanation)

    cost_fig = save_cost_vs_length_figure(
        cost_grid, cost_results, os.path.join(figures_dir, "cost_vs_length_tradeoff.png")
    )
    print(f"-> Saved: {cost_fig}")

    export_payload["cost_vs_length"] = {
        "grid": cost_grid.to_dict(),
        "algorithms": {res.algorithm_name: res.to_dict() for res in cost_results}
    }

    # -------------------------------------------------------------
    # 3. Dynamic Trolley Obstacle Detection & Replanning (Task 4)
    # -------------------------------------------------------------
    print("\n" + "=" * 80)
    print("[EXPERIMENT 3] Task 4: Dynamic Obstacle Detection & Real-Time A* Replanning")
    print("=" * 80)
    trolley_grid, trolley_pos = create_trolley_demonstration_warehouse()
    print(f"Initial Plan: A* search on known warehouse map (trolley omitted from map)...")
    replanner = DynamicReplanner(trolley_grid, [trolley_pos])
    sim_result = replanner.run_simulation()

    print(f"Original A* Plan Length: {len(sim_result.initial_planned_path)-1} moves | Cost: {sim_result.initial_planned_cost:.1f}")
    print(f"Unmapped Trolley Placed at Physical Coordinate: {trolley_pos}")
    if sim_result.replan_events:
        evt = sim_result.replan_events[0]
        print(f"Sensor Trigger: Robot at {evt.robot_position} detected blocked cell {evt.blocked_cell}!")
        print(f"Dynamic Map Update: Marked {evt.blocked_cell} as IMPASSABLE (TROLLEY).")
        print(f"Replanning: A* computed new route in {evt.time_taken_ms:.3f} ms.")
    print(f"Executed Path Length: {sim_result.total_moves} moves | Total Executed Cost: {sim_result.actual_executed_cost:.1f}")
    print(f"Replans Executed: {sim_result.replan_count} | Goal Reached: {sim_result.goal_reached}")

    trolley_fig = save_trolley_replanning_figure(
        sim_result, os.path.join(figures_dir, "trolley_replanning_demo.png")
    )
    print(f"-> Saved: {trolley_fig}")

    export_payload["trolley_replanning"] = {
        "initial_grid": trolley_grid.to_dict(),
        "trolley_pos": list(trolley_pos),
        "simulation": sim_result.to_dict()
    }

    # -------------------------------------------------------------
    # 4. Trapped Edge Case (Task 4 - Report if no alternative exists)
    # -------------------------------------------------------------
    print("\n" + "=" * 80)
    print("[EXPERIMENT 4] Task 4 Edge Case: Trolley Completely Traps Robot")
    print("=" * 80)
    trapped_wh = WarehouseGrid(height=5, width=5, start=(0, 0), goal=(4, 4))
    for c in range(5):
        if c != 2:
            trapped_wh.set_cell(2, c, CellType.SHELF)
    trapped_replanner = DynamicReplanner(trapped_wh, [(2, 2)])
    trapped_res = trapped_replanner.run_simulation()
    print(f"Alert Outcome: {trapped_res.error_message}")
    print(f"Replans Attempted: {trapped_res.replan_count} | Goal Reached: {trapped_res.goal_reached}")

    export_payload["trapped_scenario"] = {
        "grid": trapped_wh.to_dict(),
        "trolley_pos": [2, 2],
        "simulation": trapped_res.to_dict()
    }

    # -------------------------------------------------------------
    # Export JSON Payload for 3D Web UI
    # -------------------------------------------------------------
    json_path = os.path.join(web_dir, "sim_data.json")
    with open(json_path, "w") as f:
        json.dump(export_payload, f, indent=2)
    print(f"\n-> Exported 3D Simulation Data: {json_path}")

    print("\n" + "=" * 80)
    print("ALL EXPERIMENTS & ARTIFACTS COMPLETED SUCCESSFULLY!")
    print("=" * 80)


if __name__ == "__main__":
    run_and_export()
