import Roact, { createElement } from "@rbxts/roact";
import { connectComponent } from "client/roact/util/functions/connectComponent";
import { NumberParameter } from "./NumberParameter";
import { StringOptionParameter } from "./StringOptionParameter";
import { FractalId } from "shared/enums/FractalId";
import { NewtonFunction } from "shared/enums/NewtonFunction";
import {
	FractalParameterName,
	FractalParameterNameForType,
	FractalParameterValueForType,
	FractalParameters,
} from "shared/types/FractalParameters";
import { clientStore } from "client/rodux/store";
import { BooleanParameter } from "./BooleanParameter";
import { InterfaceMode } from "shared/enums/InterfaceMode";
import { TweenableNumberBinding } from "client/roact/util/classes/TweenableNumberBinding";
import { enumToArray } from "shared/enums/enumToArray";
import { StringInputParameter } from "./StringInputParameter";

export interface CoreParameterProps<T> {
	playerFacingName: string;
	order: number;

	currentValue: FractalParameterValueForType<T>;
	onNewValue: (value: T) => void;
}

interface ParametersEditorProps {
	parameters: FractalParameters;
	interfaceMode: InterfaceMode;
}

class BaseParametersEditor extends Roact.Component<ParametersEditorProps> {
	private fractalOptions = enumToArray(FractalId);
	private newtonFunctionOptions = enumToArray(NewtonFunction);

	private leftHandPosition = new TweenableNumberBinding(0.025, { time: 0.5 });
	private rightHandPosition = new TweenableNumberBinding(0.775, { time: 0.5 });

	render() {
		if (this.props.interfaceMode === InterfaceMode.Hidden) return;

		const parameters = this.props.parameters;

		function isCurrentlyFractal(fractal: FractalId) {
			return parameters.fractalId === fractal;
		}

		function createParameter<P>(
			parameterComponent: Roact.ComponentConstructor<P>,
			name: FractalParameterNameForType<P extends CoreParameterProps<infer T> ? T : never>,
			props: P extends CoreParameterProps<infer _T> ? Omit<P, "currentValue" | "onNewValue"> : never,
		) {
			return createElement(parameterComponent, {
				currentValue: parameters[name],
				onNewValue: (value: never) => clientStore.dispatch({ type: "updateParameter", name, value }),

				...props,
			} as never);
		}

		return (
			<Roact.Fragment>
				<frame
					Key="LeftHandParametersEditor"
					BackgroundTransparency={1}
					Position={this.leftHandPosition.binding.map((value) => UDim2.fromScale(value, 0.05))}
					Size={UDim2.fromScale(1, 1)}
				>
					<uilistlayout
						Padding={new UDim(0.025, 0)}
						SortOrder={Enum.SortOrder.LayoutOrder}
						FillDirection={Enum.FillDirection.Vertical}
						VerticalAlignment={Enum.VerticalAlignment.Top}
					/>

					{createParameter(StringOptionParameter, "fractalId", {
						order: 1,
						playerFacingName: "Fractal",
						options: this.fractalOptions,
						appearOnRight: true,
					})}

					{createParameter(NumberParameter, "axisSize", {
						order: 2,
						playerFacingName: "Axis Size",
					})}

					{createParameter(NumberParameter, "maxIterations", {
						order: 3,
						playerFacingName: "Max Iterations",
					})}

					{createParameter(NumberParameter, "maxStable", {
						order: 4,
						playerFacingName: "Max Stable",
					})}

					{createParameter(NumberParameter, "xOffset", { order: 5, playerFacingName: "X Offset" })}
					{createParameter(NumberParameter, "yOffset", { order: 6, playerFacingName: "Y Offset" })}

					{createParameter(NumberParameter, "magnification", {
						order: 7,
						playerFacingName: "Magnification",
						newValueConstraint: (value) => math.max(value, 1),
					})}

					{createParameter(NumberParameter, "hueShift", {
						order: 8,
						playerFacingName: "Hue Shift",
						newValueConstraint: (value) => math.clamp(value, 0, 360),
					})}
				</frame>

				<frame
					Key="RightHandParametersEditor"
					BackgroundTransparency={1}
					Position={this.rightHandPosition.binding.map((value) => UDim2.fromScale(value, 0.175))}
					Size={UDim2.fromScale(1, 1)}
				>
					<uilistlayout
						Padding={new UDim(0.025, 0)}
						SortOrder={Enum.SortOrder.LayoutOrder}
						FillDirection={Enum.FillDirection.Vertical}
						VerticalAlignment={Enum.VerticalAlignment.Top}
					/>

					{isCurrentlyFractal(FractalId.BurningShip) && (
						<Roact.Fragment>
							{createParameter(BooleanParameter, "burningShipFacesLeft", {
								order: 1,
								playerFacingName: "Ship Faces Left",
							})}
						</Roact.Fragment>
					)}

					{isCurrentlyFractal(FractalId.Julia) && (
						<Roact.Fragment>
							{createParameter(NumberParameter, "juliaRealConstant", {
								order: 1,
								playerFacingName: "Julia Real",
							})}

							{createParameter(NumberParameter, "juliaImaginaryConstant", {
								order: 2,
								playerFacingName: "Julia Imaginary",
							})}
						</Roact.Fragment>
					)}

					{isCurrentlyFractal(FractalId.Newton) && (
						<Roact.Fragment>
							{createParameter(StringOptionParameter, "newtonFunction", {
								order: 1,
								playerFacingName: "Function",
								options: this.newtonFunctionOptions,
								appearOnRight: false,
							})}

							{createParameter(BooleanParameter, "newtonPreferRootBasisHue", {
								order: 2,
								playerFacingName: "Prefer Per Root Basis Colors",
							})}

							{createParameter(NumberParameter, "newtonCoefficientReal", {
								order: 3,
								playerFacingName: "Coefficient Real",
							})}

							{createParameter(NumberParameter, "newtonCoefficientImaginary", {
								order: 4,
								playerFacingName: "Coefficient Imaginary",
							})}
						</Roact.Fragment>
					)}

					{isCurrentlyFractal(FractalId.Custom) && (
						<Roact.Fragment>
							{createParameter(StringInputParameter, "customExpression", {
								order: 1,
								playerFacingName: "Expression",
							})}
						</Roact.Fragment>
					)}
				</frame>
			</Roact.Fragment>
		);
	}

	didUpdate(previousProps: ParametersEditorProps) {
		const nowInFull = this.props.interfaceMode === InterfaceMode.FullPicture;
		const wasInFull = previousProps.interfaceMode === InterfaceMode.FullPicture;

		if (nowInFull && !wasInFull) {
			this.leftHandPosition.tween(-0.975);
			this.rightHandPosition.tween(1.775);
		} else if (!nowInFull && wasInFull) {
			this.leftHandPosition.tween(0.025);
			this.rightHandPosition.tween(0.775);
		}
	}
}

export const ParametersEditor = connectComponent(BaseParametersEditor, (state) => {
	return {
		parameters: state.fractal.parameters,
		interfaceMode: state.fractal.interfaceMode,
	};
});
