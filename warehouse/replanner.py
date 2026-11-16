"""
warehouse/replanner.py
Task 4: Obstacle Detection & Dynamic Replanning
Author: Person 5 - Eshan [BT24CSD012]

This module simulates real-time robot navigation under uncertainty.
The robot executes an initial A* plan. When an unmapped obstacle (Trolley)
is detected in the robot's immediate sensor horizon, the robot updates its
internal belief map and triggers an immediate A* replanning phase from its
current coordinate to the dispatch goal.
"""

from dataclasses import dataclass, field
from typing import List, Tuple, Optional, Dict, Any
from .grid import WarehouseGrid, CellType
from .algorithms import a_star_search, SearchResult


@dataclass
class ReplanEvent:
    """Records a single detection and replanning incident."""
    replan_number: int
    detected_at_step: int
    robot_position: Tuple[int, int]
    blocked_cell: Tuple[int, int]
    obstacle_type: str
    replan_successful: bool
    new_subpath_length: int
    new_subpath_cost: float
    time_taken_ms: float

    def to_dict(self) -> Dict[str, Any]:
        return {
            "replan_number": self.replan_number,
            "detected_at_step": self.detected_at_step,
            "robot_position": list(self.robot_position),
            "blocked_cell": list(self.blocked_cell),
            "obstacle_type": self.obstacle_type,
            "replan_successful": self.replan_successful,
            "new_subpath_length": self.new_subpath_length,
            "new_subpath_cost": self.new_subpath_cost,
            "time_taken_ms": round(self.time_taken_ms, 3)
        }


@dataclass
class TrolleySimulationResult:
    """Comprehensive outcome of the dynamic trolley detection & replanning experiment."""
    goal_reached: bool
    initial_planned_path: List[Tuple[int, int]]
    initial_planned_cost: float
    actual_executed_path: List[Tuple[int, int]]
    actual_executed_cost: float
    total_moves: int
    replan_count: int
    replan_events: List[ReplanEvent]
    trolley_positions: List[Tuple[int, int]]
    final_robot_grid: WarehouseGrid
    error_message: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "goal_reached": self.goal_reached,
            "initial_planned_path": [list(pt) for pt in self.initial_planned_path],
            "initial_planned_cost": self.initial_planned_cost,
            "actual_executed_path": [list(pt) for pt in self.actual_executed_path],
            "actual_executed_cost": self.actual_executed_cost,
            "total_moves": self.total_moves,
            "replan_count": self.replan_count,
            "replan_events": [e.to_dict() for e in self.replan_events],
            "trolley_positions": [list(tp) for tp in self.trolley_positions],
            "error_message": self.error_message
        }


class DynamicReplanner:
    """
    Simulates sensory perception, dynamic belief-state update, and real-time replanning.
    """

    def __init__(
        self,
        base_grid: WarehouseGrid,
        trolley_locations: List[Tuple[int, int]],
        sensor_range: int = 1
    ):
        """
        Args:
            base_grid: The baseline warehouse known to the robot (without trolleys).
            trolley_locations: Locations of unmapped trolleys in the physical world.
            sensor_range: Lookahead distance (default 1 cell ahead).
        """
        # Robot's internal belief map (initially oblivious to trolleys)
        self.robot_grid = base_grid.clone()

        # Physical reality map (includes true ground-truth obstacle locations)
        self.ground_truth_grid = base_grid.clone()
        for tr, tc in trolley_locations:
            self.ground_truth_grid.set_cell(tr, tc, CellType.TROLLEY)

        self.trolley_locations = trolley_locations
        self.sensor_range = sensor_range

    def run_simulation(self) -> TrolleySimulationResult:
        """
        Executes robot navigation with dynamic obstacle detection and A* replanning.
        """
        # Step 1: Initial Offline Route Planning using A*
        initial_search: SearchResult = a_star_search(self.robot_grid)

        if not initial_search.goal_reached:
            return TrolleySimulationResult(
                goal_reached=False,
                initial_planned_path=[],
                initial_planned_cost=0.0,
                actual_executed_path=[],
                actual_executed_cost=0.0,
                total_moves=0,
                replan_count=0,
                replan_events=[],
                trolley_positions=self.trolley_locations,
                final_robot_grid=self.robot_grid,
                error_message="Initial A* could not find a path to the goal even without obstacles."
            )

        current_plan = list(initial_search.path)
        initial_path_copy = list(current_plan)
        initial_cost = initial_search.total_cost

        executed_path: List[Tuple[int, int]] = [current_plan[0]]
        total_executed_cost = 0.0
        replan_events: List[ReplanEvent] = []
        replan_count = 0

        # Step 2: Step-by-Step Traversal with Forward Sensor Scanning
        step_idx = 0
        while len(current_plan) > 1:
            current_pos = current_plan[0]
            next_target = current_plan[1]

            # Sensor Scan: Check if next_target is blocked in the real physical world
            target_r, target_c = next_target
            is_blocked = (
                self.ground_truth_grid.grid[target_r][target_c] == CellType.TROLLEY or
                not self.ground_truth_grid.is_passable(target_r, target_c)
            )

            if is_blocked:
                # SENSOR DETECTION TRIGGERED!
                replan_count += 1
                # Update robot's internal belief map
                self.robot_grid.set_cell(target_r, target_c, CellType.TROLLEY)

                # Replan with A* from CURRENT robot position to goal
                replan_result = a_star_search(self.robot_grid, start_pos=current_pos)

                if not replan_result.goal_reached:
                    # Failure to replan: Robot is trapped or no alternative route exists
                    event = ReplanEvent(
                        replan_number=replan_count,
                        detected_at_step=step_idx,
                        robot_position=current_pos,
                        blocked_cell=next_target,
                        obstacle_type="Trolley",
                        replan_successful=False,
                        new_subpath_length=0,
                        new_subpath_cost=0.0,
                        time_taken_ms=replan_result.execution_time_ms
                    )
                    replan_events.append(event)
                    return TrolleySimulationResult(
                        goal_reached=False,
                        initial_planned_path=initial_path_copy,
                        initial_planned_cost=initial_cost,
                        actual_executed_path=executed_path,
                        actual_executed_cost=total_executed_cost,
                        total_moves=len(executed_path) - 1,
                        replan_count=replan_count,
                        replan_events=replan_events,
                        trolley_positions=self.trolley_locations,
                        final_robot_grid=self.robot_grid,
                        error_message=f"CRITICAL: Trolley detected at {next_target}. Robot trapped at {current_pos}. No alternative route exists!"
                    )

                # Replanning succeeded!
                event = ReplanEvent(
                    replan_number=replan_count,
                    detected_at_step=step_idx,
                    robot_position=current_pos,
                    blocked_cell=next_target,
                    obstacle_type="Trolley",
                    replan_successful=True,
                    new_subpath_length=replan_result.path_length,
                    new_subpath_cost=replan_result.total_cost,
                    time_taken_ms=replan_result.execution_time_ms
                )
                replan_events.append(event)

                # Update the active plan to the newly computed route
                current_plan = list(replan_result.path)
                continue

            # Step forward to next_target
            move_cost = self.ground_truth_grid.get_cell_cost(target_r, target_c)
            total_executed_cost += move_cost
            executed_path.append(next_target)
            current_plan = current_plan[1:]
            step_idx += 1

        return TrolleySimulationResult(
            goal_reached=True,
            initial_planned_path=initial_path_copy,
            initial_planned_cost=initial_cost,
            actual_executed_path=executed_path,
            actual_executed_cost=total_executed_cost,
            total_moves=len(executed_path) - 1,
            replan_count=replan_count,
            replan_events=replan_events,
            trolley_positions=self.trolley_locations,
            final_robot_grid=self.robot_grid,
            error_message=None
        )
