import Roact, { createRef } from "@rbxts/roact";
import { connectComponent } from "client/roact/util/functions/connectComponent";
import { AXIS_SIZE } from "shared/constants/fractal";

interface FractalViewProps {
	folder: Folder | undefined;
}

class BaseFractalView extends Roact.Component<FractalViewProps> {
	private viewportRef = createRef<ViewportFrame>();

	render() {
		return (
			<viewportframe
				Ref={this.viewportRef}
				BackgroundColor3={new Color3()}
				LightColor={new Color3(1, 1, 1)}
				Position={UDim2.fromOffset(0, -37)}
				Size={new UDim2(1, 0, 1, 37)}
			/>
		);
	}

	didMount() {
		const viewport = this.viewportRef.getValue();
		if (!viewport) return;

		const camera = new Instance("Camera");
		camera.CFrame = new CFrame(AXIS_SIZE / 2, AXIS_SIZE / 2, AXIS_SIZE);
		camera.Parent = viewport;

		viewport.CurrentCamera = camera;
	}

	didUpdate() {
		const viewport = this.viewportRef.getValue();
		if (!this.props.folder || !viewport) return;

		this.props.folder.Parent = viewport;
	}
}

export const FractalView = connectComponent(BaseFractalView, (state) => {
	return {
		folder: state.fractal.partsFolder,
	};
});
