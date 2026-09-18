import { Bell, ChevronRight, Home, Inbox, Plus, Sparkles } from "lucide-react";
import Avatar from "./components/common/Avatar";
import Badge from "./components/common/Badge";
import BrandLogo from "./components/common/BrandLogo";
import Button from "./components/common/Button";
import Card from "./components/common/Card";
import Divider from "./components/common/Divider";
import EmptyState from "./components/common/EmptyState";
import IconButton from "./components/common/IconButton";
import Input from "./components/common/Input";
import PageContainer from "./components/common/PageContainer";
import SearchInput from "./components/common/SearchInput";
import Select from "./components/common/Select";
import Spinner from "./components/common/Spinner";
import Textarea from "./components/common/Textarea";
import NavItem from "./components/navigation/NavItem";
import SidebarItem from "./components/navigation/SidebarItem";
import "./styles/showcase.css";

export default function App() {
  return (
    <PageContainer as="main" className="showcase">
      <header className="showcase__header">
        <BrandLogo showTagline />
        <div>
          <h1 className="cc-h1">ClickCart UI Foundation</h1>
          <p className="cc-body cc-text-secondary">
            Shared visual primitives for development verification.
          </p>
        </div>
      </header>
      <section className="showcase__section" aria-labelledby="actions-title">
        <h2 id="actions-title" className="cc-h3">
          Actions and status
        </h2>
        <Card>
          <div className="showcase__row">
            <Button leftIcon={<Plus />}>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline" rightIcon={<ChevronRight />}>
              Outline
            </Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button loading>Loading</Button>
            <IconButton
              icon={<Bell size={18} />}
              label="Open alerts"
              variant="subtle"
            />
          </div>
          <Divider className="showcase__divider" />
          <div className="showcase__row">
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
            <Badge>Neutral</Badge>
            <Badge variant="primary">Primary</Badge>
            <Avatar fallback="CC" online />
            <Spinner />
          </div>
        </Card>
      </section>
      <section className="showcase__section" aria-labelledby="fields-title">
        <h2 id="fields-title" className="cc-h3">
          Form controls
        </h2>
        <Card>
          <div className="showcase__form-grid">
            <Input
              label="Text input"
              placeholder="Enter text"
              helperText="Optional supporting text"
            />
            <SearchInput label="Search input" placeholder="Search" />
            <Select label="Select">
              <option>Choose an option</option>
              <option>Example option</option>
            </Select>
            <Input
              label="Error state"
              placeholder="Enter text"
              error="Review this field"
            />
            <Textarea label="Textarea" placeholder="Enter a longer message" />
            <Input
              label="Disabled input"
              value="Unavailable"
              disabled
              readOnly
            />
          </div>
        </Card>
      </section>
      <section className="showcase__section" aria-labelledby="navigation-title">
        <h2 id="navigation-title" className="cc-h3">
          Navigation primitives
        </h2>
        <div className="showcase__grid">
          <Card>
            <nav
              className="showcase__row"
              aria-label="Example horizontal navigation"
            >
              <NavItem icon={<Home />} label="Active item" active to="/" />
              <NavItem icon={<Inbox />} label="Inactive item" to="/" />
              <NavItem icon={<Inbox />} label="Disabled" disabled />
            </nav>
          </Card>
          <Card>
            <nav
              className="showcase__sidebar"
              aria-label="Example sidebar navigation"
            >
              <SidebarItem icon={<Home />} label="Active item" active />
              <SidebarItem
                icon={<Inbox />}
                label="Item with count"
                badge={<Badge variant="primary">3</Badge>}
              />
              <SidebarItem icon={<Inbox />} label="Disabled item" disabled />
            </nav>
          </Card>
        </div>
      </section>
      <section className="showcase__section" aria-labelledby="surfaces-title">
        <h2 id="surfaces-title" className="cc-h3">
          Surfaces and empty state
        </h2>
        <div className="showcase__grid">
          <Card variant="bordered">
            <h3 className="cc-h4">Bordered card</h3>
            <p className="cc-body-sm cc-text-secondary">
              Generic content surface with shared spacing.
            </p>
          </Card>
          <Card variant="soft-green">
            <EmptyState
              icon={<Sparkles />}
              title="Nothing here yet"
              description="This generic state is ready for feature teams to customize."
              action={
                <Button variant="outline" size="sm">
                  Example action
                </Button>
              }
            />
          </Card>
        </div>
      </section>
    </PageContainer>
  );
}
