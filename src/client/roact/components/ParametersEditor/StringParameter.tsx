import Roact, { createRef } from "@rbxts/roact";
import { TweenableRef } from "client/roact/util/classes/TweenableRef";

interface StringParameterProps<K extends string> {
	position: UDim2;

	name: string;
	currentOption: K;

	options: Array<K>;
	onOptionSelected: (newOption: K) => void;
}

interface StringParameterState {
	optionYSize?: number;
	isOpen: boolean;
}

export class StringParameter<K extends string> extends Roact.Component<StringParameterProps<K>, StringParameterState> {
	state = identity<StringParameterState>({
		isOpen: false,
	});

	private currentFrameRef = createRef<TextButton>();
	private arrowTweenRef = new TweenableRef<TextLabel>();

	private getOptionFrames() {
		const { optionYSize } = this.state;
		if (optionYSize === undefined) return undefined;

		const frames = [];
		let count = 1;

		for (const option of this.props.options) {
			if (option === this.props.currentOption) continue;

			frames.push(
				<textbutton
					Key="OptionFrame"
					BackgroundTransparency={1}
					Text=""
					Position={new UDim2(0, 0, 0, optionYSize * count)}
					Size={new UDim2(1, 0, 0, optionYSize)}
				>
					<textbutton
						Key="NewOption"
						Event={{
							MouseButton1Click: () => this.props.onOptionSelected(option),
						}}
						Active={false}
						BackgroundTransparency={1}
						Font={Enum.Font.Ubuntu}
						Selectable={false}
						Size={UDim2.fromScale(0.7, 1)}
						Text={option}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextSize={14}
						TextWrapped={true}
						TextXAlignment={Enum.TextXAlignment.Left}
					/>
				</textbutton>,
			);

			count += 1;
		}

		return frames;
	}

	render() {
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

				<scrollingframe
					Key="ExpandFrame"
					BackgroundColor3={Color3.fromRGB(52, 52, 52)}
					BorderSizePixel={0}
					CanvasSize={
						this.state.isOpen
							? UDim2.fromOffset(
									0,
									math.max((this.state.optionYSize ?? 0) * this.props.options.size() + 1, 0),
							  )
							: new UDim2(0, 0, 0, 0)
					}
					Selectable={false}
					SelectionGroup={false}
					Size={this.state.isOpen ? UDim2.fromScale(1, 3) : UDim2.fromScale(1, 1)}
				>
					<uicorner />
					<uipadding
						PaddingBottom={new UDim(0.1, 0)}
						PaddingLeft={new UDim(0.05, 0)}
						PaddingRight={new UDim(0.025, 0)}
						PaddingTop={new UDim(0.1, 0)}
					/>

					<textbutton
						Key="CurrentFrame"
						Ref={this.currentFrameRef}
						Event={{
							MouseButton1Click: () => this.setState({ isOpen: !this.state.isOpen }),
						}}
						BackgroundTransparency={1}
						Text=""
						Size={
							this.state.optionYSize !== undefined
								? new UDim2(1, 0, 0, this.state.optionYSize)
								: new UDim2(1, 0, 1, 0)
						}
					>
						<frame
							Key="ArrowFrame"
							BackgroundTransparency={1}
							Position={new UDim2(0.85, 0, 0, 0)}
							Size={new UDim2(0.15, 0, 1, 0)}
						>
							<textlabel
								Key="Arrow"
								Ref={this.arrowTweenRef.ref}
								BackgroundTransparency={1}
								Font={Enum.Font.Ubuntu}
								Rotation={89}
								Size={new UDim2(1, 0, 1, 0)}
								Text=">"
								TextColor3={Color3.fromRGB(255, 255, 255)}
								TextScaled={true}
								TextSize={14}
								TextWrapped={true}
							/>
						</frame>

						<textlabel
							Key="CurrentOption"
							Active={false}
							BackgroundTransparency={1}
							Font={Enum.Font.Ubuntu}
							Selectable={false}
							Size={UDim2.fromScale(0.7, 1)}
							Text={
								this.state.optionYSize !== undefined
									? `${this.props.name}: ${this.props.currentOption}`
									: "Configuring..."
							}
							TextColor3={Color3.fromRGB(255, 255, 255)}
							TextScaled={true}
							TextSize={14}
							TextWrapped={true}
							TextXAlignment={Enum.TextXAlignment.Left}
						/>
					</textbutton>

					{this.getOptionFrames()}
				</scrollingframe>
			</frame>
		);
	}

	protected didMount() {
		const currentFrame = this.currentFrameRef.getValue()!;

		this.setState({
			optionYSize: currentFrame.AbsoluteSize.Y * 2,
		});
	}

	protected didUpdate(previousProps: StringParameterProps<K>, previousState: StringParameterState): void {
		if (previousProps.currentOption !== this.props.currentOption && this.state.isOpen) {
			this.setState({ isOpen: false });
		}

		if (this.state.isOpen !== previousState.isOpen) {
			this.arrowTweenRef.tween({
				Time: 0.2,
				Goal: { Rotation: this.state.isOpen ? 270 : 89 },
			});
		}
	}
}
