"""
warehouse/grid.py
Task 1 & Task 2: Warehouse Environment & Problem Formulation
Author: Person 1 - Aryan [BT24CSD009]

This module defines the 2D warehouse grid environment and the formal AI search
problem formulation (State, Initial State, Actions, Transition Model, Goal Test,
and Step-Cost Function).
"""

from enum import IntEnum
from typing import List, Tuple, Optional, Dict, Any


class CellType(IntEnum):
    """Enumeration of cell classifications within the warehouse."""
    OPEN = 0        # Normal aisle: Cost = 1
    CROWDED = 1     # Crowded aisle (foot traffic / forklifts): Cost = 4
    SHELF = 2       # Warehouse storage shelf: Impassable
    RESTRICTED = 3  # Restricted / hazardous zone: Impassable
    TROLLEY = 4     # Dynamic rogue obstacle (temporary blockage): Impassable


# Cell type to traversal cost mapping (entering cost)
CELL_COSTS: Dict[CellType, float] = {
    CellType.OPEN: 1.0,
    CellType.CROWDED: 4.0,
    CellType.SHELF: float('inf'),
    CellType.RESTRICTED: float('inf'),
    CellType.TROLLEY: float('inf'),
}

# Character representations for ASCII visualizer
CELL_CHARS = {
    CellType.OPEN: '.',
    CellType.CROWDED: 'C',
    CellType.SHELF: '#',
    CellType.RESTRICTED: 'X',
    CellType.TROLLEY: 'T',
}

#It wraps each step inside your SearchNode
class SearchNode:
    """Represents a node in the search tree."""
    def __init__(
        self,
        state: Tuple[int, int],
        parent: Optional['SearchNode'] = None,
        action: Optional[str] = None,
        cost: float = 0.0,
        heuristic: float = 0.0
    ):
        self.state = state          # (row, col)
        self.parent = parent        # Parent SearchNode
        self.action = action        # Action taken from parent ('UP', 'DOWN', 'LEFT', 'RIGHT')
        self.cost = cost            # Path cost g(n) accumulated from start
        self.heuristic = heuristic  # Heuristic estimate h(n) to goal

    @property
    def f_score(self) -> float:
        """Total evaluation function f(n) = g(n) + h(n)."""
        return self.cost + self.heuristic

    def get_path(self) -> List[Tuple[int, int]]:
        """Reconstruct the sequence of coordinates from start to this node."""
        path = []
        curr: Optional['SearchNode'] = self
        while curr is not None:
            path.append(curr.state)
            curr = curr.parent
        return path[::-1]

    def get_actions(self) -> List[str]:
        """Reconstruct the sequence of actions from start to this node."""
        actions = []
        curr: Optional['SearchNode'] = self
        while curr is not None and curr.action is not None:
            actions.append(curr.action)
            curr = curr.parent
        return actions[::-1]


class WarehouseGrid:
    """
    Warehouse Environment & AI Search Problem Formulation (Russell & Norvig model)
    
    Formal Problem Formulation:
    1. State: (row, col) coordinates on 2D grid, 0 <= row < height, 0 <= col < width.
    2. Initial State: Starting cell (Packing Station), e.g., (0, 0).
    3. Actions: Orthogonal moves {UP: (-1, 0), DOWN: (+1, 0), LEFT: (0, -1), RIGHT: (0, +1)}.
    4. Transition Model: Result((r, c), a) = (r + dr, c + dc), valid iff within bounds
       and not in {SHELF, RESTRICTED, TROLLEY}.
    5. Goal Test: State == Destination cell (Dispatch Area), e.g., (height - 1, width - 1).
    6. Path-Cost Function: Cumulative sum of step costs entering each cell.
       Entering OPEN cell costs 1; entering CROWDED cell costs 4.
    """

    # Orthogonal actions: (dr, dc, action_name)
    ACTIONS = [
        (-1, 0, 'UP'),
        (1, 0, 'DOWN'),
        (0, -1, 'LEFT'),
        (0, 1, 'RIGHT')
    ]

    def __init__(
        self,
        height: int,
        width: int,
        start: Tuple[int, int] = (0, 0),
        goal: Tuple[int, int] = (0, 0)
    ):
        self.height = height#rows
        self.width = width#columns
        self.start = start#packing station
        self.goal = goal#dispatch area
        self.grid: List[List[CellType]] = [
            [CellType.OPEN for _ in range(width)] for _ in range(height)
        ]

#checks if safe passable and get cell costs
    def is_in_bounds(self, r: int, c: int) -> bool:
        """Check if coordinates fall within warehouse boundaries."""
        return 0 <= r < self.height and 0 <= c < self.width

    def is_passable(self, r: int, c: int) -> bool:
        """Check if cell is free of impassable physical obstacles."""
        if not self.is_in_bounds(r, c):
            return False
        cell = self.grid[r][c]
        return cell not in (CellType.SHELF, CellType.RESTRICTED, CellType.TROLLEY)

    def get_cell_cost(self, r: int, c: int) -> float:
        """Return the movement cost to enter the specified cell."""
        if not self.is_in_bounds(r, c):
            return float('inf')
        return CELL_COSTS.get(self.grid[r][c], float('inf'))

    def set_cell(self, r: int, c: int, cell_type: CellType) -> None:
        """Assign a cell type to a specific grid coordinate."""
        if self.is_in_bounds(r, c):
            self.grid[r][c] = cell_type


#get neighbours
    def get_successors(self, state: Tuple[int, int]) -> List[Tuple[Tuple[int, int], str, float]]:
        """
        Transition Model: Returns all reachable neighbor states, the action taken,
        and the step cost to enter the neighbor.
        Output: List of ((next_r, next_c), action_name, step_cost)
        """
        r, c = state
        successors = []
        for dr, dc, action in self.ACTIONS:
            nr, nc = r + dr, c + dc
            if self.is_passable(nr, nc):
                cost = self.get_cell_cost(nr, nc)
                successors.append(((nr, nc), action, cost))
        return successors

#if goal stop
    def is_goal(self, state: Tuple[int, int]) -> bool:
        """Goal Test: Returns True if state is the destination (Dispatch Area)."""
        return state == self.goal

    def clone(self) -> 'WarehouseGrid':
        """Create a deep copy of the warehouse grid."""
        new_grid = WarehouseGrid(self.height, self.width, self.start, self.goal)
        new_grid.grid = [row[:] for row in self.grid]
        return new_grid

    def to_dict(self) -> Dict[str, Any]:
        """Serialize grid representation to JSON-friendly dictionary."""
        return {
            "height": self.height,
            "width": self.width,
            "start": list(self.start),
            "goal": list(self.goal),
            "grid": [[int(cell) for cell in row] for row in self.grid]
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'WarehouseGrid':
        """Construct warehouse from JSON-friendly dictionary."""
        grid = cls(
            height=data["height"],
            width=data["width"],
            start=tuple(data["start"]),
            goal=tuple(data["goal"])
        )
        grid.grid = [[CellType(val) for val in row] for row in data["grid"]]
        return grid
#debugging ASCII
    def render_ascii(
        self,
        path: Optional[List[Tuple[int, int]]] = None,
        visited: Optional[set] = None
    ) -> str:
        """
        Render a clean, human-readable ASCII representation of the warehouse grid.
        Symbols:
          P : Packing Station (Start)
          D : Dispatch Area (Goal)
          * : Robot Path
          # : Shelf (Impassable)
          X : Restricted Zone (Impassable)
          C : Crowded Aisle (Cost 4)
          T : Trolley Obstacle (Impassable)
          . : Open Aisle (Cost 1)
        """
        path_set = set(path) if path else set()
        visited_set = visited if visited else set()
        lines = []

        # Top border
        header = "   " + "".join(f"{c%10}" for c in range(self.width))
        lines.append(header)
        lines.append("  +" + "-" * self.width + "+")

        for r in range(self.height):
            row_str = [f"{r:2d}|"]
            for c in range(self.width):
                pos = (r, c)
                if pos == self.start:
                    row_str.append('P')
                elif pos == self.goal:
                    row_str.append('D')
                elif pos in path_set:
                    row_str.append('*')
                elif self.grid[r][c] == CellType.TROLLEY:
                    row_str.append('T')
                elif self.grid[r][c] == CellType.SHELF:
                    row_str.append('#')
                elif self.grid[r][c] == CellType.RESTRICTED:
                    row_str.append('X')
                elif self.grid[r][c] == CellType.CROWDED:
                    row_str.append('C')
                elif pos in visited_set:
                    row_str.append('~')
                else:
                    row_str.append('.')
            row_str.append("|")
            lines.append("".join(row_str))

        lines.append("  +" + "-" * self.width + "+")
        return "\n".join(lines)


# =====================================================================
# Factory Functions for Standard Assignment Environments
# =====================================================================

#realistic warehpise dist for generalised benchmarking
def create_standard_warehouse() -> WarehouseGrid:
    """
    Creates a realistic 12x12 warehouse layout featuring:
    - Shelves arranged in warehouse aisles
    - Restricted storage zones near hazardous equipment
    - Crowded loading bays with heavy foot traffic (Cost = 4)
    - Packing Station at (0, 0)
    - Dispatch Area at (11, 11)
    """
    wh = WarehouseGrid(height=12, width=12, start=(0, 0), goal=(11, 11))

    # Shelves (Rows 2-4 and 7-9 creating realistic warehouse aisles)
    for r in range(2, 5):
        for c in (2, 3, 6, 7, 10):
            wh.set_cell(r, c, CellType.SHELF)
    for r in range(7, 10):
        for c in (1, 4, 5, 8, 9):
            wh.set_cell(r, c, CellType.SHELF)

    # Restricted Zones (Hazardous material or charging dock)
    for r in range(5, 7):
        wh.set_cell(r, 6, CellType.RESTRICTED)
        wh.set_cell(r, 7, CellType.RESTRICTED)

    # Crowded Aisles (Forklift crossing / high worker density: Cost 4)
    for c in range(1, 5):
        wh.set_cell(5, c, CellType.CROWDED)
    for r in range(1, 5):
        wh.set_cell(r, 0, CellType.CROWDED)
    wh.set_cell(10, 10, CellType.CROWDED)
    wh.set_cell(10, 11, CellType.CROWDED)
    wh.set_cell(11, 10, CellType.CROWDED)

    return wh

#creating to prove that shortest distance is not equal to lowest cost
def create_cost_vs_length_warehouse() -> WarehouseGrid:
    """
    Task 3 requirement:
    'Test a short, crowded route against a longer, less costly route.'

    Layout specification:
    - Direct corridor from Start (1, 1) to Goal (1, 6):
      Length = 5 moves. Cells (1, 2) through (1, 5) are CROWDED (Cost = 4), Goal is OPEN (Cost = 1).
      Total Cost = 4 * 4 + 1 = 17.
    - Northern bypass detour:
      Route through row 0: (1,1) -> (0,1) -> (0,2) -> (0,3) -> (0,4) -> (0,5) -> (0,6) -> (1,6)
      Length = 7 moves. All cells in detour are OPEN (Cost = 1).
      Total Cost = 7 * 1 = 7.
    - BFS & Greedy will choose the 5-move route (Cost 17).
    - A* will choose the 7-move detour (Cost 7).
    """
    wh = WarehouseGrid(height=4, width=8, start=(1, 1), goal=(1, 6))

    # Direct corridor between start and goal is crowded
    for c in range(2, 6):
        wh.set_cell(1, c, CellType.CROWDED)

    # Impassable barrier below to prevent south detour
    for c in range(1, 7):
        wh.set_cell(2, c, CellType.SHELF)

    return wh

#unmapped rogue trollet on A* to implement real time replanner
def create_trolley_demonstration_warehouse() -> Tuple[WarehouseGrid, Tuple[int, int]]:
    """
    Task 4 requirement:
    'Place a trolley on the initial A* route, but omit it from the robot's known map.'
    Returns:
      (known_warehouse, trolley_coordinate)
    """
    wh = WarehouseGrid(height=8, width=10, start=(0, 0), goal=(7, 9))

    # Central shelf barrier dividing the warehouse with two connecting aisles
    for r in range(0, 8):
        if r not in (2, 6):
            wh.set_cell(r, 4, CellType.SHELF)

    # Some shelves in northern and southern zones to shape realistic aisles
    for c in range(1, 4):
        wh.set_cell(4, c, CellType.SHELF)
    for c in range(6, 9):
        wh.set_cell(3, c, CellType.SHELF)

    # Compute initial A* route to find exact coordinate on path to place trolley
    from .algorithms import a_star_search
    initial_res = a_star_search(wh)
    if initial_res.goal_reached and len(initial_res.path) > 4:
        # Place trolley at the aisle bottleneck midway along path
        trolley_pos = initial_res.path[len(initial_res.path) // 2]
    else:
        trolley_pos = (6, 2)

    return wh, trolley_pos
