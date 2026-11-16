"""
warehouse/benchmark.py
Task 5: Performance Evaluation & Comparative Analysis
Author: Person 5 - Eshan [BT24CSD012]

This module conducts systematic benchmarking of BFS, DFS, Greedy Best-First,
and A* algorithms across multiple warehouse operational scenarios.
It tabulates metrics (Goal Reached, Path Length, Path Cost, Nodes Expanded,
Execution Time, Replans) and generates analytical summaries.
"""

from typing import List, Dict, Any
from .grid import (
    WarehouseGrid,
    CellType,
    create_standard_warehouse,
    create_cost_vs_length_warehouse,
    create_trolley_demonstration_warehouse
)
from .algorithms import (
    breadth_first_search,
    depth_first_search,
    greedy_best_first_search,
    a_star_search,
    SearchResult
)
from .replanner import DynamicReplanner, TrolleySimulationResult


class BenchmarkRunner:
    """Orchestrates comprehensive algorithm evaluation and reporting."""

    @staticmethod
    def run_all_algorithms(grid: WarehouseGrid) -> List[SearchResult]:
        """Execute BFS, DFS, Greedy Best-First, and A* on the provided warehouse grid."""
        results = [
            breadth_first_search(grid),
            depth_first_search(grid),
            greedy_best_first_search(grid),
            a_star_search(grid)
        ]
        return results

    @staticmethod
    def format_comparison_table(results: List[SearchResult]) -> str:
        """Construct a formatted ASCII/Markdown comparison table."""
        header = (
            f"| {'Algorithm':<20} | {'Goal Reached':<12} | {'Moves (Length)':<14} | "
            f"{'Total Cost':<10} | {'Nodes Expanded':<14} | {'Time (ms)':<10} |"
        )
        separator = (
            f"|{'-'*22}|{'-'*14}|{'-'*16}|{'-'*12}|{'-'*16}|{'-'*12}|"
        )
        rows = [header, separator]

        for res in results:
            goal_str = "YES" if res.goal_reached else "NO"
            moves_str = str(res.path_length) if res.goal_reached else "N/A"
            cost_str = f"{res.total_cost:.1f}" if res.goal_reached else "N/A"
            rows.append(
                f"| {res.algorithm_name:<20} | {goal_str:<12} | {moves_str:<14} | "
                f"{cost_str:<10} | {res.nodes_expanded:<14} | {res.execution_time_ms:<10.3f} |"
            )

        return "\n".join(rows)

    @staticmethod
    def explain_findings(results: List[SearchResult], scenario_name: str) -> str:
        """
        Generates automated explanation answering:
        'whether the shortest route also had the lowest cost'.
        """
        bfs = next((r for r in results if r.algorithm_name == "BFS"), None)
        astar = next((r for r in results if r.algorithm_name == "A*"), None)
        greedy = next((r for r in results if r.algorithm_name == "Greedy Best-First"), None)
        dfs = next((r for r in results if r.algorithm_name == "DFS"), None)

        explanation = []
        explanation.append(f"\n--- Comparative Analysis for: {scenario_name} ---")

        if bfs and astar and bfs.goal_reached and astar.goal_reached:
            if bfs.path_length < astar.path_length:
                explanation.append(
                    f"-> Shortest Route vs Lowest Cost Discrepancy:\n"
                    f"   * BFS found a route with FEWER MOVES ({bfs.path_length} moves) with higher cost ({bfs.total_cost:.1f}).\n"
                    f"   * A* chose a SLIGHTLY LONGER route ({astar.path_length} moves) with SUBSTANTIALLY LOWER COST ({astar.total_cost:.1f}).\n"
                    f"   * Conclusion: In a warehouse with non-uniform traversal costs (e.g., crowded cells cost 4 vs 1),\n"
                    f"     THE SHORTEST ROUTE IN MOVES DOES NOT NECESSARILY HAVE THE LOWEST COST."
                )
            elif bfs.total_cost > astar.total_cost:
                explanation.append(
                    f"-> Cost Inefficiency in Uninformed Search:\n"
                    f"   * BFS and A* have comparable moves, but BFS traversed high-cost cells (Total Cost: {bfs.total_cost:.1f}).\n"
                    f"   * A* optimized specifically for lowest cost (Total Cost: {astar.total_cost:.1f})."
                )
            else:
                explanation.append(
                    f"-> In this specific configuration, the minimum-step route happened to coincide with the lowest-cost route."
                )

        if greedy and greedy.goal_reached:
            explanation.append(
                f"-> Greedy Best-First expanded {greedy.nodes_expanded} nodes in {greedy.execution_time_ms:.3f} ms. "
                f"While fast, it operates blindly with respect to step cost g(n)."
            )

        if dfs and dfs.goal_reached:
            explanation.append(
                f"-> DFS expanded {dfs.nodes_expanded} nodes, generating an erratic path of {dfs.path_length} moves "
                f"(Cost: {dfs.total_cost:.1f}), demonstrating why DFS is unsuitable for optimal warehouse robotics."
            )

        return "\n".join(explanation)

    @classmethod
    def run_full_suite(cls) -> Dict[str, Any]:
        """Executes benchmarks across all required experiment scenarios."""
        report = {}

        # 1. Standard Warehouse Grid
        std_grid = create_standard_warehouse()
        std_results = cls.run_all_algorithms(std_grid)
        report["standard_warehouse"] = {
            "results": [r.to_dict() for r in std_results],
            "table": cls.format_comparison_table(std_results),
            "explanation": cls.explain_findings(std_results, "Standard Warehouse Layout")
        }

        # 2. Short Crowded vs Long Cheap Route
        cost_grid = create_cost_vs_length_warehouse()
        cost_results = cls.run_all_algorithms(cost_grid)
        report["cost_vs_length"] = {
            "results": [r.to_dict() for r in cost_results],
            "table": cls.format_comparison_table(cost_results),
            "explanation": cls.explain_findings(cost_results, "Short Crowded vs Long Cheap Corridor")
        }

        # 3. Dynamic Trolley Detection & Replanning
        trolley_grid, trolley_pos = create_trolley_demonstration_warehouse()
        replanner = DynamicReplanner(trolley_grid, [trolley_pos])
        trolley_sim = replanner.run_simulation()
        report["trolley_replanning"] = trolley_sim.to_dict()

        return report
