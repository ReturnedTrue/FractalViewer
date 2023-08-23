import Roact, { createRef } from "@rbxts/roact";

interface OptionFrameProps<K extends string> {
	ref?: Roact.Ref<TextButton>;
	position?: UDim2;
	size?: UDim2;

	value: K;
	onSelected: (newOption: K) => void;
}

class OptionFrame<K extends string> extends Roact.Component<OptionFrameProps<K>> {
	render() {
		const { ref, position, size, value, onSelected } = this.props;

		return (
			<textbutton
				Key="OptionFrame"
				Ref={ref}
				Event={{
					MouseButton1Click: () => onSelected(value),
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
					Text={value}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextSize={14}
					TextWrapped={true}
					TextXAlignment={Enum.TextXAlignment.Center}
				/>
			</textbutton>
		);
	}
}

interface StringParameterProps<K extends string> {
	position: UDim2;

	name: string;
	currentOption: K;

	options: Array<K>;
	onOptionSelected: (newOption: K) => void;
}

interface StringParameterState {
	optionSize?: UDim2;

	isOpen: boolean;
}

export class StringParameter<K extends string> extends Roact.Component<StringParameterProps<K>, StringParameterState> {
	state = identity<StringParameterState>({
		isOpen: false,
	});

	private currentOptionRef = createRef<TextButton>();

	render() {
		const { isOpen, optionSize } = this.state;

		return (
			<frame
				Key={this.props.name}
				BackgroundColor3={Color3.fromRGB(68, 68, 68)}
				BorderSizePixel={0}
				Position={this.props.position}
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
					Text={this.props.name}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextSize={14}
					TextWrapped={true}
				/>

				<OptionFrame
					ref={this.currentOptionRef}
					position={new UDim2(0.5, 0, 0, 0)}
					size={new UDim2(0.5, 0, 1, 0)}
					value={this.props.currentOption}
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
								if (option === this.props.currentOption) return;

								return <OptionFrame value={option} onSelected={this.props.onOptionSelected} />;
							})}
						</scrollingframe>
					</frame>
				)}
			</frame>
		);
	}

	protected didMount(): void {
		const currentOption = this.currentOptionRef.getValue()!;
		const absSize = currentOption.AbsoluteSize;

		this.setState({ optionSize: UDim2.fromOffset(absSize.X * 2, absSize.Y * 2) });
	}

	protected didUpdate(previousProps: StringParameterProps<K>, previousState: StringParameterState): void {
		// Close when new option selected
		if (previousProps.currentOption !== this.props.currentOption && this.state.isOpen) {
			this.setState({ isOpen: false });
		}
	}
}
