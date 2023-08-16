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
				Key="FractalView"
				Ref={this.viewportRef}
				BackgroundTransparency={1}
				LightColor={new Color3(1, 1, 1)}
				Position={UDim2.fromScale(0.25, 0.1)}
				Size={UDim2.fromScale(0.7, 0.8)}
			>
				{this.props.folder === undefined && (
					<textlabel
						Key="LoadingLabel"
						BackgroundTransparency={1}
						BorderSizePixel={0}
						Size={UDim2.fromScale(1, 0.2)}
						Position={UDim2.fromScale(0, 0.4)}
						Text="Creating View..."
						TextScaled={true}
						Font={Enum.Font.Ubuntu}
						TextColor3={new Color3(1, 1, 1)}
					/>
				)}
			</viewportframe>
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
