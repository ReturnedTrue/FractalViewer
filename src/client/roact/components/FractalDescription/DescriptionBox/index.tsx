import Roact, { createRef } from "@rbxts/roact";
import { UnifiedTextScaler } from "client/roact/util/components/UnifiedTextScaler";
import { FractalId } from "shared/enums/FractalId";
import { resolveDescription } from "./DescriptionData";
import { TextService } from "@rbxts/services";
import { PixelScrollingFrame } from "client/roact/util/components/PixelScrollingFrame";

interface DescriptionBoxProps {
	fractalViewed: FractalId;
}

interface DescriptionBoxState {
	textYSize: number;
}

export class DescriptionBox extends Roact.Component<DescriptionBoxProps, DescriptionBoxState> {
	state = {
		textYSize: 0,
	};

	private scrollingHolder = createRef<ScrollingFrame>();

	render() {
		return (
			<frame Key="DescriptionBox" BackgroundTransparency={1} Size={UDim2.fromScale(1, 1)}>
				<textlabel
					Key="FractalName"
					Text={`Fractal: ${this.props.fractalViewed}`}
					BackgroundTransparency={1}
					Position={UDim2.fromScale(0.1, 0)}
					Size={UDim2.fromScale(0.8, 0.1)}
					Font={Enum.Font.Ubuntu}
					TextColor3={new Color3(1, 1, 1)}
					TextScaled={true}
				>
					<UnifiedTextScaler />
				</textlabel>

				<PixelScrollingFrame
					pixelsPerScroll={this.state.textYSize * 0.1}
					tweenData={{
						time: 0.25,
					}}
					ref={this.scrollingHolder}
					scrollingFrameProps={{
						CanvasSize: UDim2.fromOffset(0, this.state.textYSize),
						BackgroundTransparency: 1,
						Position: UDim2.fromScale(0, 0.15),
						Size: UDim2.fromScale(1, 0.85),
					}}
				>
					<textlabel
						Key="FractalDescription"
						Text={resolveDescription(this.props.fractalViewed)}
						RichText={true}
						BackgroundTransparency={1}
						Size={UDim2.fromScale(1, 1)}
						Font={Enum.Font.Ubuntu}
						TextXAlignment={Enum.TextXAlignment.Left}
						TextYAlignment={Enum.TextYAlignment.Top}
						TextSize={32}
						TextColor3={new Color3(1, 1, 1)}
						TextWrapped={true}
					/>
				</PixelScrollingFrame>
			</frame>
		);
	}

	protected didMount() {
		const holder = this.scrollingHolder.getValue();
		if (!holder) return;

		const description = resolveDescription(this.props.fractalViewed);
		const textSize = TextService.GetTextSize(description, 32, Enum.Font.Ubuntu, holder.AbsoluteSize);

		this.setState({ textYSize: textSize.Y });
	}
}
