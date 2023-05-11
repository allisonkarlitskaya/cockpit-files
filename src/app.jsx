/*
 * This file is part of Cockpit.
 *
 * Copyright (C) 2017 Red Hat, Inc.
 *
 * Cockpit is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * Cockpit is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Cockpit; If not, see <http://www.gnu.org/licenses/>.
 */

import cockpit from 'cockpit';
import React, { useEffect, useState } from 'react';
import { Breadcrumb, BreadcrumbItem, Button, Card, CardBody, CardTitle, CardHeader, Dropdown, DropdownItem, DropdownList, Divider, Flex, FlexItem, Icon, MenuToggle, Page, PageBreadcrumb, PageSection, SearchInput } from "@patternfly/react-core";
import { ArrowLeftIcon, ArrowRightIcon, EditAltIcon, EllipsisVIcon, FileIcon, FolderIcon, ListIcon, PficonHistoryIcon, StarIcon } from "@patternfly/react-icons";

const _ = cockpit.gettext;

// To do: refresh automatically when files change
export const Application = () => {
    const [currentUser, setCurrentUser] = useState("");
    const [files, setFiles] = useState([]);
    const [path, setPath] = useState([]);

    useEffect(() => {
        cockpit.user().then(user => {
            setCurrentUser(user.name || "");
        })
                .then(() => {
                    const currentPath = path.join("/");
                    cockpit.spawn(["ls", "-p", `/home/${currentUser}/${currentPath}`], { superuser: true }).then((res) => {
                        res = res.split("\n");
                        setFiles(res.slice(0, res.length - 1));
                    });
                });
    }, [currentUser, path]);

    return (
        <Page>
            <NavigatorBreadcrumbs path={path} setPath={setPath} />
            <PageSection>
                <Card>
                    <NavigatorCardHeader />
                    <NavigatorCardBody files={files} setPath={setPath} path={path} />
                </Card>
            </PageSection>
        </Page>
    );
};

const NavigatorBreadcrumbs = ({ path, setPath }) => {
    return (
        <PageBreadcrumb stickyOnBreakpoint={{ default: "top" }}>
            <Flex>
                <FlexItem>
                    <Button variant="secondary">
                        <ArrowLeftIcon />
                    </Button>
                </FlexItem>
                <FlexItem>
                    <Button variant="secondary">
                        <ArrowRightIcon />
                    </Button>
                </FlexItem>
                <FlexItem>
                    <Button variant="secondary">
                        <PficonHistoryIcon />
                    </Button>
                </FlexItem>
                <FlexItem>
                    <Breadcrumb>
                        <BreadcrumbItem to="#" onClick={() => setPath([])}>{_("home")}</BreadcrumbItem>
                        {path.map((dir, i) => {
                            return (
                                <BreadcrumbItem to="#" onClick={() => setPath(path.slice(0, i + 1))} key={dir}>{dir}</BreadcrumbItem>
                            );
                        })}
                    </Breadcrumb>
                </FlexItem>
                <FlexItem align={{ default: 'alignRight' }}>
                    <Button variant="secondary">
                        <EditAltIcon />
                    </Button>
                </FlexItem>
                <FlexItem>
                    <Button variant="secondary">
                        <StarIcon />
                    </Button>
                </FlexItem>
                <FlexItem>
                    <DropdownWithKebab />
                </FlexItem>
            </Flex>
        </PageBreadcrumb>
    );
};

const NavigatorCardHeader = () => {
    return (
        <CardHeader>
            <CardTitle component="h2">{_("Directories & files")}</CardTitle>
            <Flex flexWrap={{ default: 'nowrap' }}>
                <SearchInput placeholder={_("Filter directory")} />
                <ViewSelector />
                <Button variant="secondary">Upload</Button>
                <FlexItem>
                    <DropdownWithKebab />
                </FlexItem>
            </Flex>
        </CardHeader>
    );
};

const NavigatorCardBody = ({ files, setPath, path }) => {
    const onDoubleClickNavigate = (dir, path, file) => {
        if (dir) {
            setPath([...path, file]);
        }
    };

    return (
        <CardBody>
            <Flex id="folder-view">
                {files.map((file) => {
                    const directory = file.substring(file.length - 1) === "/";
                    if (directory)
                        file = file.substring(0, file.length - 1);
                    return (
                        <Flex key={file} direction={{ default: "column" }} spaceItems={{ default: 'spaceItemsNone' }}>
                            <FlexItem alignSelf={{ default: "alignSelfCenter" }}>
                                <Button variant="plain" onDoubleClick={ () => onDoubleClickNavigate(directory, path, file)}>
                                    <Icon size="xl">
                                        {directory
                                            ? <FolderIcon />
                                            : <FileIcon />}
                                    </Icon>
                                </Button>
                            </FlexItem>
                            <FlexItem alignSelf={{ default: "alignSelfCenter" }}>{file}</FlexItem>
                        </Flex>
                    );
                })}
            </Flex>
        </CardBody>
    );
};

const DropdownWithKebab = () => {
    const [isOpen, setIsOpen] = useState(false);
    const onToggleClick = () => {
        setIsOpen(!isOpen);
    };
    const onSelect = (_event, itemId) => {
        setIsOpen(false);
    };
    return (
        <Dropdown
            isPlain
            isOpen={isOpen}
            onSelect={onSelect}
            onOpenChange={isOpen => setIsOpen(isOpen)}
            toggle={toggleRef =>
                <MenuToggle ref={toggleRef} aria-label="kebab dropdown toggle" variant="plain" onClick={onToggleClick} isExpanded={isOpen}>
                    <EllipsisVIcon />
                </MenuToggle>}
        >
            <DropdownList>
                <DropdownItem itemId={0} key="action1">
                    Action
                </DropdownItem>
                <DropdownItem itemId={1} key="action2">
                    Action
                </DropdownItem>
                <Divider component="li" key="separator" />
                <DropdownItem itemId={2} key="action3">
                    Action
                </DropdownItem>
            </DropdownList>
        </Dropdown>
    );
};

export const ViewSelector = () => {
    const [isOpen, setIsOpen] = useState(false);
    const onToggleClick = isOpen => setIsOpen(!isOpen);
    const onSelect = () => setIsOpen(false);
    return (
        <Dropdown
            isOpen={isOpen}
            onSelect={onSelect}
            onOpenChange={setIsOpen}
            toggle={toggleRef => <MenuToggle ref={toggleRef} onClick={() => { onToggleClick(isOpen) }} isExpanded={isOpen} variant="secondary" splitButtonOptions={{ variant: "action", items: [<Icon key="list-icon"><ListIcon /></Icon>] }} />}
        >
            <DropdownList>
                <DropdownItem itemId={0} key="action1">
                    Action
                </DropdownItem>
                <DropdownItem itemId={1} key="action2">
                    Action
                </DropdownItem>
                <Divider component="li" key="separator" />
                <DropdownItem itemId={2} key="action3">
                    Action
                </DropdownItem>
            </DropdownList>
        </Dropdown>
    );
};
