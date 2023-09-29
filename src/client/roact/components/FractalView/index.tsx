import Roact, { createElement, createRef } from "@rbxts/roact";
import { Workspace } from "@rbxts/services";
import { connectComponent } from "client/roact/util/functions/connectComponent";
import { clientStore } from "client/rodux/store";
import { AXIS_SIZE, CAMERA_FOV } from "shared/constants/fractal";

interface FractalViewProps {
	folder: Folder | undefined;
}

class BaseFractalView extends Roact.Component<FractalViewProps> {
	private viewportRef = createRef<ViewportFrame>();
	private worldModelRef = createRef<WorldModel>();
	private cameraRef = createRef<Camera>();

	render() {
		const onInput = (viewport: ViewportFrame, input: InputObject) => {
			if (input.UserInputType !== Enum.UserInputType.MouseButton1) return;

			const worldModel = this.worldModelRef.getValue();
			const camera = this.cameraRef.getValue();
			if (!(worldModel && camera)) return;

			const absolutePos = viewport.AbsolutePosition;
			const absoluteSize = viewport.AbsoluteSize;

			const { xOffset, yOffset, magnification } = clientStore.getState().fractal.parameters;

			const clickedX = ((input.Position.X - absolutePos.X) / absoluteSize.X) * AXIS_SIZE;
			const clickedY = AXIS_SIZE - ((input.Position.Y - absolutePos.Y) / absoluteSize.Y) * AXIS_SIZE;

			const pivot = new Vector3(clickedX + xOffset, clickedY + yOffset).div(magnification);

			clientStore.dispatch({ type: "setPivot", pivot: pivot });
			print("pivot set at", pivot);
		};

		return (
			<viewportframe
				Key="FractalView"
				Event={{ InputBegan: onInput }}
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

				{this.props.folder === undefined ? (
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
				) : (
					createElement("WorldModel", { [Roact.Ref]: this.worldModelRef })
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

		const worldModel = this.worldModelRef.getValue();
		if (!worldModel) return;

		this.props.folder.Parent = worldModel;
	}
}

export const FractalView = connectComponent(BaseFractalView, (state) => {
	return {
		folder: state.fractal.partsFolder,
	};
});
