import Roact, { createRef } from "@rbxts/roact";
import { RunService, UserInputService, Workspace } from "@rbxts/services";
import { connectComponent } from "client/roact/util/functions/connectComponent";
import { clientStore } from "client/rodux/store";
import { CAMERA_FOV } from "shared/constants/fractal";
import { InterfaceMode } from "client/enums/InterfaceMode";
import { FractalParameters } from "shared/types/FractalParameters";
import { FractalId } from "shared/enums/FractalId";

const playerCamera = Workspace.CurrentCamera!;

interface FractalViewProps {
	folder: Folder | false;
	interfaceMode: InterfaceMode;
	parameters: FractalParameters;
}

interface FractalViewState {
	playerViewportSize: Vector2;
}

class BaseFractalView extends Roact.Component<FractalViewProps, FractalViewState> {
	state = {
		playerViewportSize: playerCamera.ViewportSize,
	};

	private viewportRef = createRef<ViewportFrame>();
	private cameraRef = createRef<Camera>();

	render() {
		const parameters = this.props.parameters;
		const axisSize = parameters.axisSize;

		const getClickUnitIntervals = (viewport: ViewportFrame) => {
			const absolutePos = viewport.AbsolutePosition;
			const absoluteSize = viewport.AbsoluteSize;

			const inputPosition = UserInputService.GetMouseLocation();

			const unitX = (inputPosition.X - absolutePos.X) / absoluteSize.X;
			const unitY = (inputPosition.Y - absolutePos.Y) / absoluteSize.Y;

			return $tuple(unitX, 1 - unitY);
		};

		const setPivot = (viewport: ViewportFrame) => {
			const [unitX, unitY] = getClickUnitIntervals(viewport);

			const pivotX = math.round(unitX * axisSize + parameters.offsetX);
			const pivotY = math.round(unitY * axisSize + parameters.offsetY);

			clientStore.dispatch({
				type: "updateParameter",
				name: "pivot",
				value: [pivotX, pivotY],
			});
		};

		const toSigFig = (x: number, sigFig: number) => {
			const precision = 10 ** sigFig;

			return math.round(x * precision) / precision;
		};

		const assignJuliaConstants = (viewport: ViewportFrame) => {
			if (parameters.fractalId !== FractalId.Julia) return;

			do {
				const [unitX, unitY] = getClickUnitIntervals(viewport);

				const complexOffsetX = (parameters.offsetX / parameters.magnification / axisSize) * 4;
				const complexOffsetY = (parameters.offsetY / parameters.magnification / axisSize) * 4;

				const realConstant = toSigFig((unitX / parameters.magnification) * 4 - 2 + complexOffsetX, 3);
				const imaginaryConstant = toSigFig((unitY / parameters.magnification) * 4 - 2 + complexOffsetY, 3);

				if (realConstant < -2 || imaginaryConstant < -2 || realConstant > 2 || imaginaryConstant > 2) {
					return;
				}

				clientStore.dispatch({
					type: "setParameters",
					parameters: {
						juliaRealConstant: realConstant,
						juliaImaginaryConstant: imaginaryConstant,
					},
				});

				RunService.RenderStepped.Wait();
			} while (UserInputService.IsMouseButtonPressed(Enum.UserInputType.MouseButton3));
		};

		const inputBegan = (viewport: ViewportFrame, input: InputObject) => {
			if (input.UserInputType === Enum.UserInputType.MouseButton2) {
				setPivot(viewport);
			} else if (input.UserInputType === Enum.UserInputType.MouseButton3) {
				assignJuliaConstants(viewport);
			}
		};

		/*const inputChanged = (_viewport: ViewportFrame, input: InputObject) => {
			if (input.UserInputType !== Enum.UserInputType.MouseWheel) return;

			const { magnification } = clientStore.getState().fractal.parameters;

			clientStore.dispatch({
				type: "updateParameter",
				name: "magnification",
				value: math.max(magnification + MAGNIFICATION_INCREMENT * input.Position.Z, 1),
			});
		};*/

		const inFullPicture = this.props.interfaceMode === InterfaceMode.FullPicture;
		const calculatedViewSize = this.state.playerViewportSize.Y * (inFullPicture ? 0.9 : 0.75);

		return (
			<viewportframe
				Key="FractalView"
				Event={{
					InputBegan: inputBegan,
					//InputChanged: inputChanged,
				}}
				Ref={this.viewportRef}
				BackgroundTransparency={1}
				LightColor={new Color3(1, 1, 1)}
				Position={
					new UDim2(
						0,
						(this.state.playerViewportSize.X - calculatedViewSize) / 2,
						inFullPicture ? 0.025 : 0.05,
						0,
					)
				}
				Size={UDim2.fromOffset(calculatedViewSize, calculatedViewSize)}
			>
				<camera
					Ref={this.cameraRef}
					FieldOfView={CAMERA_FOV}
					CFrame={new CFrame(axisSize / 2, axisSize / 2, axisSize / 2 / math.tan(math.rad(CAMERA_FOV / 2)))}
				/>

				{this.props.interfaceMode === InterfaceMode.Hidden && (
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
		playerCamera.GetPropertyChangedSignal("ViewportSize").Connect(() => {
			this.setState({ playerViewportSize: playerCamera.ViewportSize });
		});

		const viewport = this.viewportRef.getValue();
		const camera = this.cameraRef.getValue();
		const folder = this.props.folder;
		if (!(viewport && camera && folder)) return;

		// Viewed before mount, therefore display immediately
		if (this.props.interfaceMode !== InterfaceMode.Hidden) {
			folder.Parent = viewport;
			viewport.CurrentCamera = camera;
		}
	}

	didUpdate(previousProps: FractalViewProps) {
		const viewport = this.viewportRef.getValue();
		const camera = this.cameraRef.getValue();
		const folder = this.props.folder;
		if (!(viewport && camera && folder)) return;

		const wasHidden = previousProps.interfaceMode === InterfaceMode.Hidden;
		const isCurrentlyHidden = this.props.interfaceMode === InterfaceMode.Hidden;

		// Parts are now viewed
		if (wasHidden && !isCurrentlyHidden) {
			folder.Parent = viewport;
			viewport.CurrentCamera = camera;

			// Parts are no longer viewed
		} else if (!wasHidden && isCurrentlyHidden) {
			folder.Parent = undefined;
			viewport.CurrentCamera = undefined;
		}
	}
}

export const FractalView = connectComponent(BaseFractalView, (state) => {
	return {
		folder: state.fractal.partsFolder,
		interfaceMode: state.fractal.interfaceMode,
		parameters: state.fractal.parameters,
	};
});
