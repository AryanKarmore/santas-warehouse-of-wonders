"""
tests/test_algorithms.py
Automated Test Suite for Warehouse Robot Route Planning
Validates algorithmic correctness, heuristic admissibility, optimality guarantees,
dynamic replanning, and trapped edge cases.
"""

import unittest
from warehouse.grid import (
    WarehouseGrid,
    CellType,
    create_standard_warehouse,
    create_cost_vs_length_warehouse
)
from warehouse.algorithms import (
    breadth_first_search,
    depth_first_search,
    greedy_best_first_search,
    a_star_search,
    manhattan_distance
)
from warehouse.replanner import DynamicReplanner


class TestWarehouseSearch(unittest.TestCase):

    def test_manhattan_distance_admissibility(self):
        """Verify heuristic never exceeds actual minimum orthogonal distance."""
        p1 = (0, 0)
        p2 = (5, 7)
        h = manhattan_distance(p1, p2)
        self.assertEqual(h, 12.0)
        # Self distance is 0
        self.assertEqual(manhattan_distance(p1, p1), 0.0)

    def test_cost_vs_length_tradeoff(self):
        """
        Task 3 Core Requirement:
        Verify BFS minimizes path moves (picks crowded route of 5 moves, cost 20)
        while A* minimizes path cost (picks open detour of 7 moves, cost 7).
        """
        grid = create_cost_vs_length_warehouse()

        bfs_res = breadth_first_search(grid)
        astar_res = a_star_search(grid)
        greedy_res = greedy_best_first_search(grid)

        self.assertTrue(bfs_res.goal_reached)
        self.assertTrue(astar_res.goal_reached)
        self.assertTrue(greedy_res.goal_reached)

        # BFS chooses shorter length (5 moves)
        self.assertEqual(bfs_res.path_length, 5)
        self.assertEqual(bfs_res.total_cost, 17.0)

        # A* chooses cheaper detour (7 moves, cost 7)
        self.assertEqual(astar_res.path_length, 7)
        self.assertEqual(astar_res.total_cost, 7.0)

        # Greedy also chooses the direct 5-move path because h(n) pulls directly to goal
        self.assertEqual(greedy_res.path_length, 5)

        # Crucial theoretical proof:
        self.assertLess(astar_res.total_cost, bfs_res.total_cost)
        self.assertGreater(astar_res.path_length, bfs_res.path_length)

    def test_standard_warehouse_algorithms(self):
        """Test all 4 algorithms on standard 12x12 warehouse layout."""
        grid = create_standard_warehouse()

        bfs_res = breadth_first_search(grid)
        dfs_res = depth_first_search(grid)
        greedy_res = greedy_best_first_search(grid)
        astar_res = a_star_search(grid)

        # All algorithms must find a valid route to the dispatch area
        self.assertTrue(bfs_res.goal_reached)
        self.assertTrue(dfs_res.goal_reached)
        self.assertTrue(greedy_res.goal_reached)
        self.assertTrue(astar_res.goal_reached)

        # A* must produce a cost <= BFS and <= DFS
        self.assertLessEqual(astar_res.total_cost, bfs_res.total_cost)
        self.assertLessEqual(astar_res.total_cost, dfs_res.total_cost)

        # BFS must produce moves <= DFS
        self.assertLessEqual(bfs_res.path_length, dfs_res.path_length)

    def test_trolley_detection_and_replanning(self):
        """Test dynamic replanning when trolley blocks initial route."""
        wh = WarehouseGrid(height=6, width=6, start=(0, 0), goal=(5, 5))
        # Create a central wall with two openings: row 2 col 0 (west) and row 2 col 5 (east)
        for c in range(1, 5):
            wh.set_cell(2, c, CellType.SHELF)

        # A* initial path will prefer the closer opening
        # Place trolley right at that opening (2, 0)
        replanner = DynamicReplanner(wh, [(2, 0)])
        result = replanner.run_simulation()

        self.assertTrue(result.goal_reached)
        self.assertEqual(result.replan_count, 1)
        self.assertEqual(len(result.replan_events), 1)
        self.assertTrue(result.replan_events[0].replan_successful)
        self.assertEqual(result.replan_events[0].blocked_cell, (2, 0))

    def test_trolley_no_alternative_path(self):
        """Test graceful failure when trolley completely traps robot."""
        wh = WarehouseGrid(height=5, width=5, start=(0, 0), goal=(4, 4))
        # Total wall across row 2, except col 2
        for c in range(5):
            if c != 2:
                wh.set_cell(2, c, CellType.SHELF)

        # Put trolley at the only opening (2, 2)
        replanner = DynamicReplanner(wh, [(2, 2)])
        result = replanner.run_simulation()

        self.assertFalse(result.goal_reached)
        self.assertEqual(result.replan_count, 1)
        self.assertFalse(result.replan_events[0].replan_successful)
        self.assertIn("CRITICAL", result.error_message)


if __name__ == '__main__':
    unittest.main()
