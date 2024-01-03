import Roact, { createElement } from "@rbxts/roact";
import { connectComponent } from "client/roact/util/functions/connectComponent";
import { NumberParameter } from "./NumberParameter";
import { StringOptionParameter } from "./StringOptionParameter";
import { FractalId } from "shared/enums/FractalId";
import { NewtonFunction } from "shared/enums/NewtonFunction";
import {
	FractalParameterNameForType,
	FractalParameterValueForType,
	FractalParameters,
} from "shared/types/FractalParameters";
import { clientStore } from "client/rodux/store";
import { BooleanParameter } from "./BooleanParameter";
import { InterfaceMode } from "client/enums/InterfaceMode";
import { TweenableNumberBinding } from "client/roact/util/classes/TweenableNumberBinding";
import { enumToArray } from "client/enums/enumToArray";
import { onFullPictureChange } from "client/roact/util/functions/onFullPictureChange";
import { BarnsleyFernName } from "shared/enums/BarnsleyFernName";
import { RenderingMethod } from "shared/enums/RenderingMethod";
import { ExpressionParameter } from "./ExpressionParameter";
import { fractalStepFunctions } from "client/controllers/CalculationController/FractalCalculators";

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

const mapKeysToArray = <K extends defined, V>(map: Map<K, V>) => {
	const array = new Array<K>();

	for (const [key] of pairs(map)) {
		array.push(key);
	}

	return array;
};

class BaseParametersEditor extends Roact.Component<ParametersEditorProps> {
	private fractalOptions = enumToArray(FractalId);
	private renderingOptions = enumToArray(RenderingMethod);
	private newtonFunctionOptions = enumToArray(NewtonFunction);
	private barnsleyNameOptions = enumToArray(BarnsleyFernName);
	private juliaCorrespondingOptions = mapKeysToArray(fractalStepFunctions);

	private leftHandPosition = new TweenableNumberBinding(0.025, { time: 0.5 });
	private rightHandPosition = new TweenableNumberBinding(0.775, { time: 0.5 });

	render() {
		if (this.props.interfaceMode === InterfaceMode.Hidden) return;

		const parameters = this.props.parameters;

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

		function fractalIsNotOneOf(fractals: FractalId[]) {
			return !fractals.includes(parameters.fractalId);
		}

		const getEditorsForCurrentFractal = () => {
			switch (parameters.fractalId) {
				case FractalId.Julia:
					return [
						createParameter(NumberParameter, "juliaRealConstant", {
							order: 1,
							playerFacingName: "Julia Real",
							newValueConstraint: (value) => math.clamp(value, -2, 2),
						}),

						createParameter(NumberParameter, "juliaImaginaryConstant", {
							order: 2,
							playerFacingName: "Julia Imaginary",
							newValueConstraint: (value) => math.clamp(value, -2, 2),
						}),

						createParameter(StringOptionParameter, "juliaCorrespondingSet", {
							order: 3,
							playerFacingName: "Corresponding Set",
							options: this.juliaCorrespondingOptions,
							appearOnRight: false,
						}),
					];

				case FractalId.Newton:
					return [
						createParameter(StringOptionParameter, "newtonFunction", {
							order: 1,
							playerFacingName: "Function",
							options: this.newtonFunctionOptions,
							appearOnRight: false,
						}),

						createParameter(BooleanParameter, "newtonPreferRootBasisHue", {
							order: 2,
							playerFacingName: "Prefer Per Root Basis Colors",
						}),

						createParameter(NumberParameter, "newtonCoefficientReal", {
							order: 3,
							playerFacingName: "Coefficient Real",
						}),

						createParameter(NumberParameter, "newtonCoefficientImaginary", {
							order: 4,
							playerFacingName: "Coefficient Imaginary",
						}),
					];

				case FractalId.BarnsleyFern:
					return [
						createParameter(StringOptionParameter, "barnsleyFernName", {
							order: 1,
							playerFacingName: "Fern",
							options: this.barnsleyNameOptions,
							appearOnRight: false,
						}),
					];

				case FractalId.Custom:
					return [
						createParameter(ExpressionParameter, "customInitialValueExpression", {
							order: 1,
							playerFacingName: "Initial Value",
							availableVariables: ["c", "x", "y"],
							appearOnRight: false,
						}),

						createParameter(ExpressionParameter, "customCalculationExpression", {
							order: 2,
							playerFacingName: "Calculate",
							availableVariables: ["c", "x", "y", "z", "n"],
							appearOnRight: false,
						}),
					];

				default:
					return;
			}
		};

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

					{fractalIsNotOneOf([FractalId.BarnsleyFern, FractalId.Newton]) &&
						createParameter(NumberParameter, "maxStable", {
							order: 4,
							playerFacingName: "Max Stable",
							newValueConstraint: (value) => math.max(value, 0),
						})}

					{createParameter(NumberParameter, "offsetX", { order: 5, playerFacingName: "Offset X" })}
					{createParameter(NumberParameter, "offsetY", { order: 6, playerFacingName: "Offset Y" })}

					{createParameter(NumberParameter, "magnification", {
						order: 7,
						playerFacingName: "Magnification",
						newValueConstraint: (value) => math.max(value, 1),
					})}

					{fractalIsNotOneOf([FractalId.Buddhabrot, FractalId.BarnsleyFern, FractalId.Newton]) &&
						createParameter(StringOptionParameter, "renderingMethod", {
							order: 8,
							playerFacingName: "Rendering Method",
							options: this.renderingOptions,
							appearOnRight: true,
						})}

					{createParameter(NumberParameter, "hueShift", {
						order: 9,
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

					{getEditorsForCurrentFractal()}
				</frame>
			</Roact.Fragment>
		);
	}

	protected didUpdate(previousProps: ParametersEditorProps) {
		onFullPictureChange(
			this.props.interfaceMode,
			previousProps.interfaceMode,
			() => {
				this.leftHandPosition.tween(-0.975);
				this.rightHandPosition.tween(1.775);
			},
			() => {
				this.leftHandPosition.tween(0.025);
				this.rightHandPosition.tween(0.775);
			},
		);
	}
}

export const ParametersEditor = connectComponent(BaseParametersEditor, (state) => {
	return {
		parameters: state.fractal.parameters,
		interfaceMode: state.fractal.interfaceMode,
	};
});
