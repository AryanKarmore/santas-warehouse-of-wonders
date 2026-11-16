"""
warehouse/visualizer.py
Visualizer & Figure Generator for Reports and Screenshots
Author: Person 5 - ESHAN

Generates publication-quality Matplotlib figures of warehouse search paths,
cost-vs-length trade-offs, performance metric bar charts, and trolley replanning.
"""

import os
from typing import List, Tuple, Optional
import matplotlib
matplotlib.use('Agg') # Headless backend for reliable server/batch execution
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.colors import ListedColormap
import numpy as np

from .grid import WarehouseGrid, CellType
from .algorithms import SearchResult
from .replanner import TrolleySimulationResult


# Distinct visual styling palette
COLOR_MAP = {
    CellType.OPEN: "#F3F4F6",         # Light neutral gray
    CellType.CROWDED: "#FDE68A",      # Light warning amber
    CellType.SHELF: "#1F2937",        # Dark charcoal
    CellType.RESTRICTED: "#EF4444",   # Intense crimson
    CellType.TROLLEY: "#DC2626",      # Bright red hazard
}


def draw_grid_axes(
    ax: plt.Axes,
    grid: WarehouseGrid,
    path: Optional[List[Tuple[int, int]]] = None,
    visited: Optional[List[Tuple[int, int]]] = None,
    title: str = "",
    trolley_pos: Optional[Tuple[int, int]] = None
) -> None:
    """Renders a 2D warehouse grid onto a Matplotlib Axes with rich graphic styling."""
    h, w = grid.height, grid.width

    # Numeric representation for background mesh
    matrix = np.zeros((h, w))
    for r in range(h):
        for c in range(w):
            matrix[r, c] = grid.grid[r][c].value

    if trolley_pos and grid.is_in_bounds(trolley_pos[0], trolley_pos[1]):
        matrix[trolley_pos[0], trolley_pos[1]] = CellType.TROLLEY.value

    # Color mapping
    cmap = ListedColormap([
        COLOR_MAP[CellType.OPEN],
        COLOR_MAP[CellType.CROWDED],
        COLOR_MAP[CellType.SHELF],
        COLOR_MAP[CellType.RESTRICTED],
        COLOR_MAP[CellType.TROLLEY],
    ])

    ax.imshow(matrix, cmap=cmap, origin='upper', vmin=0, vmax=4)

    # Grid line overlays
    ax.set_xticks(np.arange(-0.5, w, 1), minor=True)
    ax.set_yticks(np.arange(-0.5, h, 1), minor=True)
    ax.grid(which='minor', color='#9CA3AF', linestyle='-', linewidth=0.75, alpha=0.6)
    ax.tick_params(which='minor', size=0)

    # Clean ticks
    ax.set_xticks(range(w))
    ax.set_yticks(range(h))
    ax.set_xticklabels(range(w), fontsize=8)
    ax.set_yticklabels(range(h), fontsize=8)

    # Visited cells overlay
    if visited:
        visited_set = set(visited) - {grid.start, grid.goal}
        for vr, vc in visited_set:
            if grid.grid[vr][vc] == CellType.OPEN:
                ax.add_patch(plt.Rectangle((vc - 0.4, vr - 0.4), 0.8, 0.8, color='#93C5FD', alpha=0.35))

    # Path line overlay
    if path and len(path) > 1:
        path_c = [c for r, c in path]
        path_r = [r for r, c in path]
        ax.plot(path_c, path_r, color='#4F46E5', linewidth=3, marker='o', markersize=4, zorder=5)

    # Draw Start (Packing Station)
    sr, sc = grid.start
    ax.add_patch(plt.Circle((sc, sr), 0.35, color='#10B981', zorder=6))
    ax.text(sc, sr, 'P', color='white', ha='center', va='center', weight='bold', fontsize=9, zorder=7)

    # Draw Goal (Dispatch Area)
    gr, gc = grid.goal
    ax.add_patch(plt.Circle((gc, gr), 0.35, color='#3B82F6', zorder=6))
    ax.text(gc, gr, 'D', color='white', ha='center', va='center', weight='bold', fontsize=9, zorder=7)

    # Draw Trolley if specified
    if trolley_pos:
        tr, tc = trolley_pos
        ax.add_patch(plt.Rectangle((tc - 0.35, tr - 0.35), 0.7, 0.7, color='#B91C1C', zorder=6))
        ax.text(tc, tr, 'T', color='white', ha='center', va='center', weight='bold', fontsize=9, zorder=7)

    ax.set_title(title, fontsize=10, weight='bold', pad=8)


def create_legend_handles() -> List[mpatches.Patch]:
    """Generates standard legend entries for warehouse components."""
    return [
        mpatches.Patch(facecolor=COLOR_MAP[CellType.OPEN], edgecolor='#9CA3AF', label='Open Aisle (Cost 1)'),
        mpatches.Patch(facecolor=COLOR_MAP[CellType.CROWDED], edgecolor='#D97706', label='Crowded Cell (Cost 4)'),
        mpatches.Patch(facecolor=COLOR_MAP[CellType.SHELF], edgecolor='black', label='Shelf (Impassable)'),
        mpatches.Patch(facecolor=COLOR_MAP[CellType.RESTRICTED], edgecolor='black', label='Restricted (Impassable)'),
        mpatches.Patch(facecolor=COLOR_MAP[CellType.TROLLEY], edgecolor='black', label='Trolley Obstacle (Impassable)'),
        mpatches.Patch(facecolor='#10B981', label='Packing Station (Start)'),
        mpatches.Patch(facecolor='#3B82F6', label='Dispatch Area (Goal)'),
        mpatches.Patch(facecolor='#4F46E5', label='Robot Route'),
    ]


def save_algorithm_comparison_figure(
    grid: WarehouseGrid,
    results: List[SearchResult],
    output_path: str = "output_comparison.png"
) -> str:
    """Renders a 2x2 comparison grid of all 4 algorithms on the standard layout."""
    fig, axes = plt.subplots(2, 2, figsize=(14, 12))
    axes = axes.flatten()

    for idx, (res, ax) in enumerate(zip(results, axes)):
        title = (
            f"{res.algorithm_name}\n"
            f"Moves: {res.path_length} | Cost: {res.total_cost:.1f} | "
            f"Expanded: {res.nodes_expanded} | Time: {res.execution_time_ms:.2f}ms"
        )
        draw_grid_axes(ax, grid, path=res.path, visited=res.visited_nodes, title=title)

    fig.legend(
        handles=create_legend_handles(),
        loc='lower center',
        ncol=4,
        bbox_to_anchor=(0.5, 0.02),
        fontsize=9
    )
    plt.suptitle("Warehouse Robot Route Planning - 4 Search Algorithms Comparison", fontsize=14, weight='bold', y=0.98)
    plt.tight_layout(rect=[0, 0.06, 1, 0.95])
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    plt.savefig(output_path, dpi=200)
    plt.close()
    return output_path


def save_cost_vs_length_figure(
    grid: WarehouseGrid,
    results: List[SearchResult],
    output_path: str = "output_cost_vs_length.png"
) -> str:
    """Visualizes the Task 3 Short Crowded vs Long Cheap Route comparison."""
    fig, axes = plt.subplots(len(results), 1, figsize=(10, 3 * len(results)))

    for res, ax in zip(results, axes):
        title = (
            f"{res.algorithm_name} -> Length: {res.path_length} moves | Total Cost: {res.total_cost:.1f} "
            f"({'CHEAP DETOUR' if res.total_cost < 15 else 'SHORT CROWDED'})"
        )
        draw_grid_axes(ax, grid, path=res.path, title=title)

    fig.legend(
        handles=create_legend_handles()[:4],
        loc='lower center',
        ncol=4,
        bbox_to_anchor=(0.5, 0.01),
        fontsize=8
    )
    plt.suptitle("Task 3 Test: Short Crowded Route vs. Longer Less-Costly Route", fontsize=12, weight='bold', y=0.99)
    plt.tight_layout(rect=[0, 0.04, 1, 0.97])
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    plt.savefig(output_path, dpi=200)
    plt.close()
    return output_path


def save_trolley_replanning_figure(
    sim_result: TrolleySimulationResult,
    output_path: str = "output_trolley_replanning.png"
) -> str:
    """Visualizes the 3-stage dynamic replanning process."""
    fig, axes = plt.subplots(1, 3, figsize=(18, 6))

    # Panel 1: Initial Offline Plan
    draw_grid_axes(
        axes[0],
        sim_result.final_robot_grid,
        path=sim_result.initial_planned_path,
        title=f"Stage 1: Initial Planned A* Route\n(Path Length: {len(sim_result.initial_planned_path)-1}, Cost: {sim_result.initial_planned_cost:.1f})"
    )

    # Panel 2: Trolley Encounter
    trolley_loc = sim_result.trolley_positions[0] if sim_result.trolley_positions else (3, 3)
    replan_event = sim_result.replan_events[0] if sim_result.replan_events else None
    pos_at_detect = replan_event.robot_position if replan_event else sim_result.initial_planned_path[0]

    draw_grid_axes(
        axes[1],
        sim_result.final_robot_grid,
        path=sim_result.actual_executed_path[:replan_event.detected_at_step + 1] if replan_event else [],
        title=f"Stage 2: Trolley Detected at {trolley_loc}!\nRobot halted at {pos_at_detect} and updates map",
        trolley_pos=trolley_loc
    )

    # Panel 3: Dynamic Replanned Route
    draw_grid_axes(
        axes[2],
        sim_result.final_robot_grid,
        path=sim_result.actual_executed_path,
        title=f"Stage 3: Dynamic A* Replanned Route Executed\n(Total Moves: {sim_result.total_moves}, Cost: {sim_result.actual_executed_cost:.1f})",
        trolley_pos=trolley_loc
    )

    fig.legend(
        handles=create_legend_handles(),
        loc='lower center',
        ncol=4,
        bbox_to_anchor=(0.5, 0.02),
        fontsize=9
    )
    plt.suptitle("Task 4: Dynamic Obstacle (Trolley) Detection & Real-Time A* Replanning", fontsize=14, weight='bold', y=0.98)
    plt.tight_layout(rect=[0, 0.07, 1, 0.94])
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    plt.savefig(output_path, dpi=200)
    plt.close()
    return output_path


def save_metrics_bar_chart(
    results: List[SearchResult],
    output_path: str = "output_metrics_chart.png"
) -> str:
    """Generates comparative bar chart of Cost, Length, and Nodes Expanded."""
    names = [r.algorithm_name for r in results]
    costs = [r.total_cost for r in results]
    lengths = [r.path_length for r in results]
    nodes = [r.nodes_expanded for r in results]

    x = np.arange(len(names))
    width = 0.25

    fig, ax1 = plt.subplots(figsize=(10, 5))

    rects1 = ax1.bar(x - width, costs, width, label='Total Cost', color='#EF4444')
    rects2 = ax1.bar(x, lengths, width, label='Path Length (Moves)', color='#3B82F6')

    ax2 = ax1.twinx()
    rects3 = ax2.bar(x + width, nodes, width, label='Nodes Expanded', color='#10B981', alpha=0.85)

    ax1.set_xlabel('Search Algorithm', weight='bold')
    ax1.set_ylabel('Cost / Moves', weight='bold')
    ax2.set_ylabel('Nodes Expanded', weight='bold')
    ax1.set_xticks(x)
    ax1.set_xticklabels(names, weight='bold')

    # Combined legend
    lines1, labels1 = ax1.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax1.legend(lines1 + lines2, labels1 + labels2, loc='upper left')

    plt.title('Algorithm Performance Comparison on Standard Warehouse Layout', fontsize=12, weight='bold')
    plt.tight_layout()
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    plt.savefig(output_path, dpi=200)
    plt.close()
    return output_path
