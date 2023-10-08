import Roact, { createRef } from "@rbxts/roact";
import { UserInputService } from "@rbxts/services";
import { connectComponent } from "client/roact/util/functions/connectComponent";
import { clientStore } from "client/rodux/store";
import { AXIS_SIZE, CAMERA_FOV, MAGNIFICATION_INCREMENT } from "shared/constants/fractal";

interface FractalViewProps {
	folder: Folder | undefined;
}

class BaseFractalView extends Roact.Component<FractalViewProps> {
	private viewportRef = createRef<ViewportFrame>();
	private cameraRef = createRef<Camera>();

	render() {
		const inputBegan = (viewport: ViewportFrame, input: InputObject) => {
			if (input.UserInputType !== Enum.UserInputType.MouseButton2) return;
			const { xOffset, yOffset, magnification } = clientStore.getState().fractal.parameters;

			const absolutePos = viewport.AbsolutePosition;
			const absoluteSize = viewport.AbsoluteSize;

			const scaledX = ((input.Position.X - absolutePos.X) / absoluteSize.X) * AXIS_SIZE;
			const scaledY = AXIS_SIZE - ((input.Position.Y - absolutePos.Y) / absoluteSize.Y) * AXIS_SIZE;

			const pivotX = math.round((scaledX + xOffset) / magnification);
			const pivotY = math.round((scaledY + yOffset) / magnification);

			clientStore.dispatch({
				type: "updateParameter",
				name: "pivot",
				value: [pivotX, pivotY],
			});
		};

		const inputChanged = (_viewport: ViewportFrame, input: InputObject) => {
			if (input.UserInputType !== Enum.UserInputType.MouseWheel) return;

			const { magnification } = clientStore.getState().fractal.parameters;

			clientStore.dispatch({
				type: "updateParameter",
				name: "magnification",
				value: math.max(magnification + MAGNIFICATION_INCREMENT * input.Position.Z, 1),
			});
		};

		return (
			<viewportframe
				Key="FractalView"
				Event={{
					InputBegan: inputBegan,
					InputChanged: inputChanged,
				}}
				Ref={this.viewportRef}
				BackgroundTransparency={1}
				LightColor={new Color3(1, 1, 1)}
				Position={UDim2.fromScale(0.35, 0.05)}
				Size={UDim2.fromOffset(700, 700)}
			>
				<camera
					Ref={this.cameraRef}
					FieldOfView={CAMERA_FOV}
					CFrame={
						new CFrame(AXIS_SIZE / 2, AXIS_SIZE / 2, AXIS_SIZE / 2 / math.tan(math.rad(CAMERA_FOV / 2)))
					}
				/>

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
		const camera = this.cameraRef.getValue();
		if (!(viewport && camera)) return;

		viewport.CurrentCamera = camera;
	}

	didUpdate() {
		if (!this.props.folder || this.props.folder.Parent) return;

		const viewport = this.viewportRef.getValue();
		if (!viewport) return;

		this.props.folder.Parent = viewport;
	}
}

export const FractalView = connectComponent(BaseFractalView, (state) => {
	return {
		folder: state.fractal.partsFolder,
	};
});
