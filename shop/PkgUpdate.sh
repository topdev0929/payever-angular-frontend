#!/bin/bash

set -x

builder_module=${1}
cosf_project_id="198"
bef_project_id="428"
# package_name="@pe/builder-${builder_module}"

# Fetch commit hash from detatched branch
commit_hash=$(git branch --contains HEAD \
    | grep "*" \
    | cut -c21-27)

GITLAB_TOKEN="tVUeMCwr3SUWod4UGxDD"

# Get BEF commit details
commit_det=$(curl \
    --header "Private-Token: ${GITLAB_TOKEN}" \
    "https://gitlab.devpayever.com/api/v4/projects/${bef_project_id}/repository/commits/${commit_hash}")

# Get BEF branch name from commit ref
branch_name=$(echo ${commit_det} \
    | jq -r ".last_pipeline.ref")

# Get BEF commit title from commit details
commit_title=$(echo ${commit_det} \
    | jq -r ".title")

if [ "${#branch_name}" -gt "7" ]
then

    # If commit ref has detached head string
    # get BEF branch name from commit title(prefix)
    branch_name=$(echo ${commit_title} \
        | cut -c1-7)

    if [ "${branch_name}" = "Merge b" ]
    then

        # get BEF branch name from commit title(suffix)
        branch_name=$(echo ${commit_title} \
            | cut -c34-40)

    fi

fi

# full path of package.json for builder module
module_pkg_json="src/modules/${builder_module}/package.json"

# loop through all files pushed in latest commit
# for files_commited in `git diff-tree --no-commit-id --name-only -r ${commit_hash}`; 
flag="false"

for files_commited in `git log -m -1 --name-only --pretty="format:" ${commit_hash}`; 
do

    # if builder module's package.json presnt in latest commit
    if [ "${module_pkg_json}" = "${files_commited}" ];
    then

        # set flag as true
        flag="true"
        
    fi;

done

# if builder module's package.json presnt in latest commit
if [ "${flag}" = "true" ]
then

    echo "Changes to src/modules/${builder_module}/package.json were present in the commit"

    if [ "${branch_name}" = "master" ]
    then

        # if merged to master
        # - increament package version
        # - set COSF branch name without BEF

        # Get BEF commit message from commit hash
        mtm_branch_name=$(echo ${commit_title} \
            | cut -c15-21)
        mtm_branch_num=$(echo ${mtm_branch_name} \
            | sed 's/BEF-//g')
        cosf_branch_name="COSF-${mtm_branch_num}-BF"
        f_branch_name=${cosf_branch_name}
        curr_version=$(cat ./dist/libs/${builder_module}/package.json \
            | jq -r '.version')
        curr_ver_suffix=${curr_version: -1}
        new_ver_suffix=$((curr_ver_suffix+1))
        new_version=$(echo ${curr_version} \
            | sed "s/.$/${new_ver_suffix}/g")

    else

        # if pushed to feature branch
        # - set COSF branch name with BEF
        branch_num=$(echo ${branch_name} | sed 's/BEF-//g')
        cosf_branch_name="COSF-${branch_num}-BF"
        f_branch_name=${cosf_branch_name}
        curr_version=$(cat ./dist/libs/${builder_module}/package.json | jq -r '.version')
        new_version="${curr_version}-${branch_name}"

    fi

    # Publish npm package
    cp .npmrc ./dist/libs/${builder_module} 
    cd ./dist/libs/${builder_module}

    tmp=$(mktemp)
    jq --arg new_version "${new_version}" '.version = $new_version' package.json > "$tmp"
    mv "$tmp" package.json

    npm publish
    cd -

    # Create a COSF branch
    curl \
        --request POST \
        --header "Private-Token: ${GITLAB_TOKEN}" \
        "https://gitlab.devpayever.com/api/v4/projects/${cosf_project_id}/repository/branches?branch=${f_branch_name}&ref=master"

    # Get latest version of COSF package.json
    pck_json=$(curl \
        --header "Private-Token: ${GITLAB_TOKEN}" \
        "https://gitlab.devpayever.com/api/v4/projects/${cosf_project_id}/repository/files/package.json?ref=${f_branch_name}" \
        | jq -r ".content" \
        | base64 -d)

    # Get updated version and update package.json
    pck_json_new=$(echo $pck_json \
        | jq "." \
        | sed -E "/(builder-${builder_module})/c\    \"@pe\/builder-${builder_module}\": \"^${new_version}\",")

    # Encode the content
    pck_json_new_encoded=$(echo $pck_json_new \
        | jq "." | base64 -w 0)

    # Commit the updated package.json to COSF
    curl \
        --request PUT \
        --header "Private-Token: ${GITLAB_TOKEN}" \
        --header "Content-Type: application/json" \
        --data '{ "content": "'"${pck_json_new_encoded}"'" }' \
        "https://gitlab.devpayever.com/api/v4/projects/${cosf_project_id}/repository/files/package%2Ejson?branch=${f_branch_name}&commit_message=${f_branch_name}%20Update%20package%20JSON&file_path=package%2Ejson&encoding=base64"

    sleep 30s


    # Wait for COSF build job to finish
    # then run "Deploy to exclusive domain" job

    # Fetch the above commit details/pipeline id
    pipeline_id=$(curl \
        --header "Private-Token: ${GITLAB_TOKEN}" \
        "https://gitlab.devpayever.com/api/v4/projects/${cosf_project_id}/repository/commits/${f_branch_name}" \
        | jq '.last_pipeline.id')

    # Fetch the job id from pipeline where job name "Deploy to exclusive domain"
    job_id=$(curl \
        --header "Private-Token: ${GITLAB_TOKEN}" \
        "https://gitlab.devpayever.com/api/v4/projects/${cosf_project_id}/pipelines/${pipeline_id}/jobs" \
        | jq '.[] | select(.name == "Deploy to exclusive domain") | .id')

    job_play_flag="false"

    while [ "${job_play_flag}" = "false" ]
    do

        # Fetch the job status of Build stage from pipeline where job name "Build"
        job_status=$(curl \
            --header "Private-Token: ${GITLAB_TOKEN}" \
            "https://gitlab.devpayever.com/api/v4/projects/${cosf_project_id}/pipelines/${pipeline_id}/jobs" \
            | jq -r '.[] | select(.name == "Build") | .status')
        
        if [ "${job_status}" = "success" ]
        then

            # Play the job "Deploy to exclusive domain"
            curl \
                --request POST \
                --header "Private-Token: ${GITLAB_TOKEN}" \
                "https://gitlab.devpayever.com/api/v4/projects/${cosf_project_id}/jobs/${job_id}/play"
            
            # set flag to true since job ran
            job_play_flag="true"

        elif [ "${job_status}" = "failed" ]
        then

            exit 1 # terminate and indicate error

        fi

        sleep 60s

    done


    # If BEF merged to master
    # create a COSF Merge Request and accept
    # update BEF master with incremented package version
    if [ "${branch_name}" = "master" ] && [ "${commit_title}" = "Merge branch '${mtm_branch_name}' into 'master'" ]
    then

        # Create a COSF Merge Request and accept
            
        # Create Merge Request for COSF feature branch to master
        curl \
            --request POST \
            --header "Private-Token: ${GITLAB_TOKEN}" \
            "https://gitlab.devpayever.com/api/v4/projects/${cosf_project_id}/merge_requests?source_branch=${f_branch_name}&target_branch=master&title=${f_branch_name}%20Update%20package%20JSON"

        mr_title="$f_branch_name Update package JSON"

        # Get single MR, MR id & MR iid
        merge_request=$(curl \
            --header "Private-Token: ${GITLAB_TOKEN}" \
            "https://gitlab.devpayever.com/api/v4/projects/${cosf_project_id}/merge_requests" \
	        | jq --arg mr_title "$mr_title" '.[] | select(.title == $mr_title)')

        mr_id=$(echo ${merge_request} \
            | jq '.id')

        mr_iid=$(echo ${merge_request} \
            | jq '.iid')

        # Accept Merge Request for COSF feature branch to master
        curl \
            --request POST \
            --header "Private-Token: ${GITLAB_TOKEN}" \
            "https://gitlab.devpayever.com/api/v4/projects/${cosf_project_id}/merge_requests/${mr_iid}/merge?id=${mr_id}&merge_request_iid=${mr_iid}"

        
        # Update BEF master with incremented package version

        # Get latest version of BEF master's modules package.json
        mod_pck_json=$(curl \
            --header "Private-Token: ${GITLAB_TOKEN}" \
            "https://gitlab.devpayever.com/api/v4/projects/${bef_project_id}/repository/files/src%2Fmodules%2F${builder_module}%2Fpackage%2Ejson?ref=master" \
            | jq -r ".content" \
            | base64 -d)

        # Get updated version and update package.json
        mod_pck_json_new=$(echo $mod_pck_json \
            | jq --arg new_version "${new_version}" '.version =$new_version')

        # Encode the content
        mod_pck_json_new_encoded=$(echo $mod_pck_json_new \
            | jq "." | base64 -w 0)

        # Commit the updated package.json to BEF master
        curl \
            --request PUT \
            --header "Private-Token: ${GITLAB_TOKEN}" \
            --header "Content-Type: application/json" \
            --data '{ "content": "'"${mod_pck_json_new_encoded}"'" }' \
            "https://gitlab.devpayever.com/api/v4/projects/${bef_project_id}/repository/files/src%2Fmodules%2F${builder_module}%2Fpackage%2Ejson?branch=master&commit_message=${f_branch_name}%20Update%20builder-{builder_module}%20package%20JSON&file_path=package%2Ejson&encoding=base64"

    fi

else

    echo "No changes to src/modules/${builder_module}/package.json were present in the commit"

fi