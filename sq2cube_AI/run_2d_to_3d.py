import argparse
from pathlib import Path

import cv2
import numpy as np
import open3d as o3d


def make_demo_image(width: int = 640, height: int = 640) -> np.ndarray:
    img = np.zeros((height, width, 3), dtype=np.uint8)
    for y in range(height):
        value = int(40 + (180 * y / max(height - 1, 1)))
        img[y, :, :] = (value, value, value)
    cv2.circle(img, (width // 2, height // 2), width // 4, (30, 120, 230), -1)
    cv2.rectangle(img, (60, 80), (220, 260), (210, 80, 50), -1)
    cv2.putText(img, "SQ2CUBE", (width // 4, height - 60), cv2.FONT_HERSHEY_SIMPLEX, 1.1, (255, 255, 255), 2)
    return img


def estimate_depth_ai_or_fallback(rgb_image: np.ndarray) -> np.ndarray:
    try:
        import torch

        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        midas = torch.hub.load("intel-isl/MiDaS", "MiDaS_small", trust_repo=True)
        midas.to(device).eval()
        transforms = torch.hub.load("intel-isl/MiDaS", "transforms", trust_repo=True)
        transform = transforms.small_transform

        batch = transform(rgb_image).to(device)
        with torch.no_grad():
            prediction = midas(batch)
            prediction = torch.nn.functional.interpolate(
                prediction.unsqueeze(1),
                size=rgb_image.shape[:2],
                mode="bicubic",
                align_corners=False,
            ).squeeze()
        depth = prediction.cpu().numpy()
        depth = np.nan_to_num(depth)
        depth = (depth - depth.min()) / (depth.max() - depth.min() + 1e-8)
        return depth.astype(np.float32)
    except Exception:
        gray = cv2.cvtColor(rgb_image, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255.0
        edges = cv2.Canny((gray * 255).astype(np.uint8), 70, 180).astype(np.float32) / 255.0
        depth = 0.8 * gray + 0.2 * (1.0 - edges)
        depth = cv2.GaussianBlur(depth, (7, 7), 0)
        depth = (depth - depth.min()) / (depth.max() - depth.min() + 1e-8)
        return depth.astype(np.float32)


def depth_to_point_cloud(
    rgb_image: np.ndarray, depth: np.ndarray, stride: int = 2, depth_scale: float = 0.9
) -> o3d.geometry.PointCloud:
    h, w = depth.shape
    ys, xs = np.mgrid[0:h:stride, 0:w:stride]
    zs = depth[0:h:stride, 0:w:stride] * depth_scale

    x_norm = (xs.astype(np.float32) / max(w - 1, 1)) - 0.5
    y_norm = 0.5 - (ys.astype(np.float32) / max(h - 1, 1))
    points = np.stack([x_norm, y_norm, zs], axis=-1).reshape(-1, 3)
    colors = (rgb_image[0:h:stride, 0:w:stride].reshape(-1, 3).astype(np.float32)) / 255.0

    pcd = o3d.geometry.PointCloud()
    pcd.points = o3d.utility.Vector3dVector(points)
    pcd.colors = o3d.utility.Vector3dVector(colors)
    return pcd


def depth_to_mesh(rgb_image: np.ndarray, depth: np.ndarray, stride: int = 2, depth_scale: float = 0.9) -> o3d.geometry.TriangleMesh:
    h, w = depth.shape
    h2 = len(range(0, h, stride))
    w2 = len(range(0, w, stride))

    ys, xs = np.mgrid[0:h:stride, 0:w:stride]
    zs = depth[0:h:stride, 0:w:stride] * depth_scale
    x_norm = (xs.astype(np.float32) / max(w - 1, 1)) - 0.5
    y_norm = 0.5 - (ys.astype(np.float32) / max(h - 1, 1))
    verts = np.stack([x_norm, y_norm, zs], axis=-1).reshape(-1, 3)

    triangles = []
    for r in range(h2 - 1):
        for c in range(w2 - 1):
            i0 = r * w2 + c
            i1 = i0 + 1
            i2 = i0 + w2
            i3 = i2 + 1
            triangles.append([i0, i2, i1])
            triangles.append([i1, i2, i3])

    mesh = o3d.geometry.TriangleMesh()
    mesh.vertices = o3d.utility.Vector3dVector(verts)
    mesh.triangles = o3d.utility.Vector3iVector(np.asarray(triangles, dtype=np.int32))
    vertex_colors = (rgb_image[0:h:stride, 0:w:stride].reshape(-1, 3).astype(np.float32)) / 255.0
    mesh.vertex_colors = o3d.utility.Vector3dVector(vertex_colors)
    mesh.compute_vertex_normals()
    return mesh


def save_depth_preview(depth: np.ndarray, out_path: Path) -> None:
    depth_uint8 = (depth * 255.0).clip(0, 255).astype(np.uint8)
    colored = cv2.applyColorMap(depth_uint8, cv2.COLORMAP_INFERNO)
    cv2.imwrite(str(out_path), colored)


def run(input_path: Path | None, output_dir: Path, demo: bool, stride: int) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    if demo:
        rgb = make_demo_image()
        image_name = "demo"
    else:
        if input_path is None or not input_path.exists():
            raise FileNotFoundError("Input image not found. Pass --input or use --demo.")
        bgr = cv2.imread(str(input_path), cv2.IMREAD_COLOR)
        if bgr is None:
            raise ValueError("Could not read input image with OpenCV.")
        rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
        image_name = input_path.stem

    depth = estimate_depth_ai_or_fallback(rgb)
    pcd = depth_to_point_cloud(rgb, depth, stride=stride)
    mesh = depth_to_mesh(rgb, depth, stride=stride)

    depth_file = output_dir / f"{image_name}_depth.png"
    ply_file = output_dir / f"{image_name}.ply"
    obj_file = output_dir / f"{image_name}.obj"

    save_depth_preview(depth, depth_file)
    o3d.io.write_point_cloud(str(ply_file), pcd)
    o3d.io.write_triangle_mesh(str(obj_file), mesh, write_vertex_normals=True)

    print(f"Done. Depth preview: {depth_file}")
    print(f"Done. Point cloud:   {ply_file}")
    print(f"Done. Mesh:          {obj_file}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="2D image to pseudo-3D asset runner (AI depth with fallback).")
    parser.add_argument("--input", type=str, default=None, help="Path to input image.")
    parser.add_argument("--output-dir", type=str, default="results", help="Where outputs are saved.")
    parser.add_argument("--demo", action="store_true", help="Run using generated demo image.")
    parser.add_argument("--stride", type=int, default=2, help="Sampling stride for mesh/point cloud density.")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    run(
        input_path=Path(args.input) if args.input else None,
        output_dir=Path(args.output_dir),
        demo=args.demo,
        stride=max(1, args.stride),
    )
