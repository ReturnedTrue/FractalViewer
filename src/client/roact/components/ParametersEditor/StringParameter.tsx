import Roact, { createRef } from "@rbxts/roact";
import { CoreParameterProps } from ".";
import { clientStore } from "client/rodux/store";
import { FractalParameterValueForType } from "client/rodux/reducers/fractal";
import { UnifiedTextScaler } from "client/roact/util/components/UnifiedTextScaler";

interface OptionFrameProps {
	ref?: Roact.Ref<TextButton>;
	position?: UDim2;
	size?: UDim2;

	optionValue: FractalParameterValueForType<string>;
	onSelected: () => void;
}

class OptionFrame extends Roact.Component<OptionFrameProps> {
	render() {
		const { ref, position, size, optionValue, onSelected } = this.props;

		return (
			<textbutton
				Key="OptionFrame"
				Ref={ref}
				Event={{
					MouseButton1Click: () => onSelected(),
				}}
				BackgroundColor3={Color3.fromRGB(52, 52, 52)}
				BorderSizePixel={0}
				Position={position}
				Size={size}
			>
				<uicorner />
				<uipadding
					PaddingBottom={new UDim(0.1, 0)}
					PaddingLeft={new UDim(0.1, 0)}
					PaddingRight={new UDim(0.1, 0)}
					PaddingTop={new UDim(0.1, 0)}
				/>
				<textlabel
					Key="OptionText"
					BackgroundTransparency={1}
					Font={Enum.Font.Ubuntu}
					Size={new UDim2(1, 0, 1, 0)}
					Text={optionValue}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextSize={14}
					TextWrapped={true}
					TextXAlignment={Enum.TextXAlignment.Center}
				>
					<UnifiedTextScaler />
				</textlabel>
			</textbutton>
		);
	}
}

interface StringParameterProps extends CoreParameterProps<string> {
	position: UDim2;
	options: Array<FractalParameterValueForType<string>>;
}

interface StringParameterState {
	optionSize?: UDim2;

	isOpen: boolean;
}

export class StringParameter extends Roact.Component<StringParameterProps, StringParameterState> {
	state = identity<StringParameterState>({
		isOpen: false,
	});

	private currentOptionRef = createRef<TextButton>();

	render() {
		const { name, currentValue, playerFacingName, position } = this.props;
		const { isOpen, optionSize } = this.state;

		return (
			<frame
				Key={playerFacingName}
				BackgroundColor3={Color3.fromRGB(68, 68, 68)}
				BorderSizePixel={0}
				Position={position}
				Size={new UDim2(0.2, 0, 0.05, 0)}
			>
				<uicorner />
				<uipadding
					PaddingBottom={new UDim(0.1, 0)}
					PaddingLeft={new UDim(0.05, 0)}
					PaddingRight={new UDim(0.025, 0)}
					PaddingTop={new UDim(0.1, 0)}
				/>
				<textlabel
					Key="ParameterName"
					BackgroundTransparency={1}
					Font={Enum.Font.Ubuntu}
					Size={new UDim2(0.425, 0, 1, 0)}
					Text={playerFacingName}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextSize={14}
					TextWrapped={true}
				>
					<UnifiedTextScaler />
				</textlabel>

				<OptionFrame
					ref={this.currentOptionRef}
					position={new UDim2(0.5, 0, 0, 0)}
					size={new UDim2(0.5, 0, 1, 0)}
					optionValue={currentValue}
					onSelected={() => this.setState({ isOpen: !isOpen })}
				/>

				{isOpen && optionSize !== undefined && (
					<frame
						Key="AppearFrame"
						BackgroundColor3={Color3.fromRGB(68, 68, 68)}
						BorderSizePixel={0}
						ClipsDescendants={true}
						Position={new UDim2(1.1, 0, 0, 0)}
						Size={new UDim2(0.6, 0, 2, 0)}
					>
						<uicorner />
						<scrollingframe
							Key="InnerFrame"
							BackgroundTransparency={1}
							CanvasSize={
								new UDim2(0, 0, 0, (this.props.options.size() - 1) * (optionSize.Y.Offset * (4 / 3)))
							}
							ClipsDescendants={false}
							Position={new UDim2(0.1, 0, 0.1, 0)}
							ScrollBarThickness={0}
							Selectable={false}
							SelectionGroup={false}
							Size={new UDim2(0.8, 0, 0.8, 0)}
						>
							<uigridlayout
								CellPadding={new UDim2(0, 0, 0, optionSize.Y.Offset / 3)}
								CellSize={this.state.optionSize}
								FillDirectionMaxCells={1}
								HorizontalAlignment={Enum.HorizontalAlignment.Center}
								SortOrder={Enum.SortOrder.LayoutOrder}
							/>

							{this.props.options.mapFiltered((option) => {
								if (option === this.props.currentValue) return;

								const selected = () => {
									clientStore.dispatch({
										type: "updateSingleParameter",
										name: name,
										value: option,
									});
								};

								return <OptionFrame optionValue={option} onSelected={selected} />;
							})}
						</scrollingframe>
					</frame>
				)}
			</frame>
		);
	}

	protected didMount(): void {
		const currentOption = this.currentOptionRef.getValue()!;

		const setSize = () => {
			const absSize = currentOption.AbsoluteSize;

			this.setState({ optionSize: UDim2.fromOffset(absSize.X, absSize.Y) });
		};

		setSize();
		currentOption.GetPropertyChangedSignal("AbsoluteSize").Connect(setSize);
	}

	protected didUpdate(previousProps: StringParameterProps, previousState: StringParameterState): void {
		// Close when new option selected
		if (previousProps.currentValue !== this.props.currentValue && this.state.isOpen) {
			this.setState({ isOpen: false });
		}
	}
}
