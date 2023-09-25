import Roact, { createElement, createRef } from "@rbxts/roact";
import { Workspace } from "@rbxts/services";
import { connectComponent } from "client/roact/util/functions/connectComponent";
import { clientStore } from "client/rodux/store";
import { AXIS_SIZE } from "shared/constants/fractal";

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

			const actualX = ((input.Position.X - absolutePos.X) / absoluteSize.X) * camera.ViewportSize.X;
			const actualY = ((input.Position.Y - absolutePos.Y) / absoluteSize.Y) * camera.ViewportSize.Y;

			const ray = camera.ViewportPointToRay(actualX, actualY);
			const result = worldModel.Raycast(ray.Origin, ray.Direction.mul(1000));
			if (!result) return;

			const position = result.Instance.Position;
			clientStore.dispatch({
				type: "setPivot",
				// TODO: Why this is even happening I have no idea, also need to factor magnification
				pivot: position.add(new Vector3(position.X > AXIS_SIZE / 2 ? 50 : -50, 0, 0)),
			});

			print("pivot set at", clientStore.getState().fractal.pivot);
		};

		return (
			<viewportframe
				Key="FractalView"
				Event={{ InputBegan: onInput }}
				Ref={this.viewportRef}
				BackgroundTransparency={1}
				LightColor={new Color3(1, 1, 1)}
				Position={UDim2.fromScale(0.25, 0.05)}
				Size={UDim2.fromScale(0.7, 0.8)}
			>
				<camera Ref={this.cameraRef} CFrame={new CFrame(AXIS_SIZE / 2, AXIS_SIZE / 2, AXIS_SIZE)} />

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
		if (this.props.folder && !this.props.folder.Parent) {
			const worldModel = this.worldModelRef.getValue();
			if (!worldModel) return;

			this.props.folder.Parent = worldModel;
		}
	}
}

export const FractalView = connectComponent(BaseFractalView, (state) => {
	return {
		folder: state.fractal.partsFolder,
	};
});
